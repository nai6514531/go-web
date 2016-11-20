package service

import (
	"maizuo.com/soda-manager/src/server/common"
)

type TradeService struct {
}

func (self *TradeService) BasicOfDevice(serialNumber string, account string) (*[]*map[string]interface{}, error) {
	var sql string = ""
	list := make([]*map[string]interface{}, 0)
	param := make([]interface{}, 0)
	sql = "select a.name,a.servicephone,a.agencyid,w.deviceno,w.passwd,w.usermobile,w.price,w.washtype," +
	"w.inserttime,i.address,w.status,w.localid from box_wash w left join box_admin a on " +
	"w.companyid=a.localid left join box_info i on w.deviceno=i.deviceno "

	if serialNumber != "" {
		sql += " where i.deviceno=? "
		param = append(param, serialNumber)
	}else if account != "" {
		sql += " where w.usermobile=? "
		param = append(param, account)
	}

	sql += "order by w.inserttime desc limit 10"

	rows, err := common.MNDB.Raw(sql, param...).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		m := make(map[string]interface{}, 0)
		var name string
		var servicephone string
		var agencyid int
		var deviceno string
		var passwd string
		var usermobile string
		var price float64
		var washtype int
		var inserttime string
		var address string
		var status int
		var localid int
		err := rows.Scan(&name, &servicephone, &agencyid, &deviceno, &passwd, &usermobile, &price, &washtype, &inserttime, &address, &status, &localid)
		m["admin"] = name
		m["telephone"] = servicephone
		m["address"] = address
		m["account"] = usermobile
		m["token"] = passwd
		m["amount"] = price
		m["pulseType"] = washtype
		m["time"] = inserttime
		if err != nil {
			return nil, err
		}
		list = append(list, &m)
	}
	return &list, nil
}
