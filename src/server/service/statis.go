package service

import (
	"maizuo.com/soda-manager/src/server/model/muniu"
	"maizuo.com/soda-manager/src/server/common"
	"strings"
	"maizuo.com/soda-manager/src/server/kit/functions"
)

type StatisService struct {
}

func BoxAdminByLocalId(localId int) (*muniu.BoxAdmin, error) {
	admin := &muniu.BoxAdmin{}
	r := common.MNDB.Where("localid = ?", localId).First(admin)
	if r.Error != nil {
		return nil, r.Error
	}
	return admin, nil
}

func (self *StatisService) Consume(userId int, date string) (*[]*map[string]interface{}, error) {
	list := make([]*map[string]interface{}, 0)
	var sql string = ""
	var companyId int = -1
	var agencyId int = -1
	param := make([]interface{}, 0)

	admin, err := BoxAdminByLocalId(userId - 1)
	if err != nil {
		return nil, err
	}

	if admin.UserType == "1" {
		agencyId = admin.LocalId
	} else if admin.UserType == "2" {
		companyId = admin.LocalId
	}

	sql = "select substring(b.inserttime,1,7) d," +
		"sum(b.price) money,count(distinct deviceno) dc," +
		"sum(case when b.washtype='601' then 1 else 0 end) dt," +
		"sum(case when b.washtype='602' then 1 else 0 end) kx," +
		"sum(case when b.washtype='603' then 1 else 0 end) bz," +
		"sum(case when b.washtype='604' then 1 else 0 end) dw " +
		"from box_wash b where b.companyid=? " +
		"group by substring(b.inserttime,1,7) order by d desc"
	if len(date) == 7 {
		sql = "select substring(b.inserttime,1,10) d," +
			"sum(b.price) money,count(distinct deviceno) dc," +
			"sum(case when b.washtype='601' then 1 else 0 end) dt," +
			"sum(case when b.washtype='602' then 1 else 0 end) kx," +
			"sum(case when b.washtype='603' then 1 else 0 end) bz," +
			"sum(case when b.washtype='604' then 1 else 0 end) dw " +
			"from box_wash b where substring(b.inserttime,1,7)=? and b.companyid=? " +
			"group by substring(b.inserttime,1,10) order by d desc"
	} else if len(date) == 10 {
		//i.devicetype,i.companyid,i.deviceno,a.name,i.address address,
		sql = "select i.devicetype,i.companyid,i.deviceno,IFNULL(a.name,'') name,IFNULL(i.address,'') address," +
			"sum(case when b.price is null then 0 else b.price end) money, " +
			"count(distinct b.deviceno) dc," +
			"sum(case when b.washtype='601' then 1 else 0 end) dt," +
			"sum(case when b.washtype='602' then 1 else 0 end) kx," +
			"sum(case when b.washtype='603' then 1 else 0 end) bz," +
			"sum(case when b.washtype='604' then 1 else 0 end) dw " +
			"from box_info i left join (select * from box_wash where substring(inserttime,1,10)=? and companyid!=0) b on b.deviceno=i.deviceno " +
			"left join box_admin a on i.companyid=a.localid " +
			"where i.companyid=? " +
			"group by i.deviceno order by a.localid,i.deviceno"
	}
	/**
	else {
		sql = "select i.devicetype,i.companyid,substring(b.inserttime,1,10) d,i.deviceno,IFNULL(a.name,''),IFNULL(i.address,'') address," +
			"sum(case when b.price is null then 0 else b.price end) money, " +
			"sum(case when b.washtype='601' then 1 else 0 end) dt," +
			"sum(case when b.washtype='602' then 1 else 0 end) kx," +
			"sum(case when b.washtype='603' then 1 else 0 end) bz," +
			"sum(case when b.washtype='604' then 1 else 0 end) dw " +
			"from box_info i left join (select * from box_wash where substring(inserttime,1,10)=curdate() and companyid!=0) b on b.deviceno=i.deviceno " +
			"left join box_admin a on i.companyid=a.localid " +
			"where i.companyid=? " +
			"group by i.deviceno order by a.localid,i.deviceno";
	}
	*/
	if companyId == -1 {
		if agencyId == -1 {
			sql = strings.Replace(sql, " and b.companyid=?", " and b.companyid!=0", -1)
			sql = strings.Replace(sql, "where b.companyid=?", "where b.companyid!=0", -1)
			sql = strings.Replace(sql, "where i.companyid=?", "where i.companyid!=0", -1)
		} else {
			agency := "(select localid from box_admin b where agencyid=?)"
			sql = strings.Replace(sql, " and b.companyid=?", " and b.companyid in " + agency, -1)
			sql = strings.Replace(sql, "where b.companyid=?", "where b.companyid in " + agency, -1)
			sql = strings.Replace(sql, "where i.companyid=?", "where i.companyid in " + agency, -1)
		}
	}

	if date != "" {
		param = append(param, date)
	}
	if companyId != -1 {
		param = append(param, companyId)
	}
	if companyId == -1 && agencyId != -1 {
		param = append(param, agencyId)
	}
	rows, err := common.MNDB.Raw(sql, param...).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		m := make(map[string]interface{}, 0)
		var _date string    //日期
		var money float64 //金额
		var userId int
		var userName string
		var deviceType int
		var serialNumber string
		var address string
		var dc int      //模块数
		var dt int      //单脱
		var kx int      //快洗
		var bz int      //标准
		var dw int      //大物

		if len(date) == 10 {
			err := rows.Scan(&deviceType, &userId, &serialNumber, &userName, &address, &money, &dc, &dt, &kx, &bz, &dw)
			if err != nil {
				return nil, err
			}
			m["deviceType"] = _date
			m["userId"] = userId
			m["serialNumber"] = serialNumber
			m["userName"] = userName
			m["address"] = address
			m["money"] = money
			m["deviceCount"] = dc
			m["firstPulseAmount"] = dt
			m["secondPulseAmount"] = kx
			m["thirdPulseAmount"] = bz
			m["fourthPulseAmount"] = dw
			m["amount"] = money
		} else {
			err := rows.Scan(&_date, &money, &dc, &dt, &kx, &bz, &dw)
			if err != nil {
				return nil, err
			}
			m["date"] = _date
			m["deviceCount"] = dc
			m["firstPulseAmount"] = dt
			m["secondPulseAmount"] = kx
			m["thirdPulseAmount"] = bz
			m["fourthPulseAmount"] = dw
			m["amount"] = money
		}
		list = append(list, &m)
	}
	return &list, nil
}

func (self *StatisService) Operate(date string) (*[]*map[string]interface{}, error) {
	list := make([]*map[string]interface{}, 0)
	param := make([]interface{}, 0)
	var sql string = ""
	sql = "select * from box_stat_month order by d desc"
	if date != "" {
		sql = "select * from box_stat_date where substring(d,1,7)=? order by d desc"
	}

	if date != "" {
		param = append(param, date)
	}
	rows, err := common.MNDB.Raw(sql, param...).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		m := make(map[string]interface{}, 0)
		var d string    //日期
		var dc int      //空闲模块数
		var u int       //新增用户数
		var r float64       //充值金额
		var c float64       //消费金额
		var ic int      //新增模块
		err := rows.Scan(&d, &u, &r, &c, &dc, &ic)
		if err != nil {
			return nil, err
		}
		m["date"] = d
		m["increaseUserCount"] = u
		m["enabledDeviceCount"] = dc
		m["increaseDeviceCount"] = ic
		m["rechargeAmount"] = r
		m["consumeAmount"] = c
		list = append(list, &m)
	}
	return &list, nil
}

func (self *StatisService) Device(userId int, serialNumber string, date string) (*[]*map[string]interface{}, error) {
	var companyId int = -1
	list := make([]*map[string]interface{}, 0)
	param := make([]interface{}, 0)
	var err error
	/*admin, err := BoxAdminByLocalId(userId - 1)
	if err != nil {
		return nil, err
	}*/

	var sql string = ""
	sql = "select i.companyid, case when b.inserttime is null then substring(curdate(),1,7) else substring(b.inserttime,1,7) end d," +
		"i.deviceno,i.address,sum(case when b.companyid=i.companyid then b.price else 0 end) money, " +
		"sum(case when b.washtype='601' and b.companyid=i.companyid then 1 else 0 end) dt," +
		"sum(case when b.washtype='602' and b.companyid=i.companyid then 1 else 0 end) kx," +
		"sum(case when b.washtype='603' and b.companyid=i.companyid then 1 else 0 end) bz," +
		"sum(case when b.washtype='604' and b.companyid=i.companyid then 1 else 0 end) dw " +
		"from box_info i left join box_wash b on i.deviceno=b.deviceno " +
		"where i.companyid=? group by i.deviceno,substring(b.inserttime,1,7) " +
		"order by d desc,deviceno"
	if len(date) == 7 {
		sql = "select b.companyid,substring(b.inserttime,1,10) d," +
			"i.deviceno,i.address,sum(b.price) money, " +
			"sum(case when b.washtype='601' then 1 else 0 end) dt," +
			"sum(case when b.washtype='602' then 1 else 0 end) kx," +
			"sum(case when b.washtype='603' then 1 else 0 end) bz," +
			"sum(case when b.washtype='604' then 1 else 0 end) dw " +
			"from box_wash b left join box_info i on b.deviceno=i.deviceno " +
			"where b.companyid=? and b.deviceno=? and substring(b.inserttime,1,7)=? " +
			"group by substring(b.inserttime,1,10) order by d desc"
	} else if len(date) == 10 {
		sql = "select b.inserttime d,i.deviceno,i.address,b.price money,b.usermobile from box_wash b " +
			"left join box_info i on b.deviceno=i.deviceno " +
			"where b.companyid=? and b.deviceno=? and substring(b.inserttime,1,10)=? " +
			"order by d desc"
	}

	companyId = userId - 1
	param = append(param, companyId)

	/*if admin.UserType == "1" || admin.UserType == "0"{
		companyId = admin.LocalId
	}
	if companyId != -1 {
		param = append(param, companyId)
	}else {
		e := &functions.DefinedError{}
		e.Msg = "无操作权限"
		err = e
		return nil, err
	}*/
	if serialNumber != "" {
		param = append(param, serialNumber)
	}
	if date != "" {
		param = append(param, date)
	}

	if serialNumber != "" || date != "" {
		if len(param) < 3 {
			e := &functions.DefinedError{}
			e.Msg = "less param"
			err = e
			return nil, err
		}
	}

	rows, err := common.MNDB.Raw(sql, param...).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		m := make(map[string]interface{}, 0)
		var companyid int
		var d string
		var deviceno string
		var address string
		var money float64
		var dt int
		var kx int
		var bz int
		var dw int

		err := rows.Scan(&companyid, &d, &deviceno, &address, &money, &dt, &kx, &bz, &dw)
		if err != nil {
			return nil, err
		}
		m["date"] = d
		m["serialNumber"] = deviceno
		m["firstPulseAmount"] = dt
		m["secondPulseAmount"] = kx
		m["thirdPulseAmount"] = bz
		m["fourthPulseAmount"] = dw
		m["amount"] = money
		m["address"] = address
		list = append(list, &m)
	}
	return &list, nil
}
