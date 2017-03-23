package service

import (
	_ "github.com/go-sql-driver/mysql"
	"github.com/hoisie/mustache"
	"github.com/jinzhu/gorm"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/kit/functions"
	"maizuo.com/soda-manager/src/server/model"
	"strings"
	"time"
)

type StatisService struct {
}

func (self *StatisService) Consume(userId int, date string, page int, perPage int) (*[]*map[string]interface{}, error) {
	list := make([]*map[string]interface{}, 0)
	devices := &[]*model.Device{}
	var sql string = ""
	userRoleRelService := &UserRoleRelService{}
	deviceService := &DeviceService{}
	role, err := userRoleRelService.BasicByUserId(userId)
	if err != nil {
		return nil, err
	}
	var r *gorm.DB
	if role.RoleId == 1 { //管理员
		if len(date) == 7 {
			sql = `
			select date,
			sum(total_amount),
			sum(total_device),
			sum(total_mode_1),
			sum(total_mode_2),
			sum(total_mode_3),
			sum(total_mode_4)
			from daily_consume
			where created_timestamp
			between
			unix_timestamp(cast(date_format(? ,'%Y-%m-01') as date))
			and
			unix_timestamp(last_day(date_add(date(?), interval 0 month)))
			group by date
			order by date desc;
			`
			r = common.SodaMngDB_R.Raw(sql, date+"-01", date+"-01")
		} else if len(date) == 10 {
			/*
				from_unixtime(created_timestamp,'%Y-%m-%d')=?
				unix_timestamp(date_sub(date('2016-01-01'), interval -1 day))
			*/
			t, _ := time.Parse("2006-01-02", date)
			after := t.AddDate(0, 0, 1).Format("2006-01-02")
			sql = `
			select device_serial,
			sum(value),
			sum(case when device_mode=1 then 1 else 0 end),
			sum(case when device_mode=2 then 1 else 0 end),
			sum(case when device_mode=3 then 1 else 0 end),
			sum(case when device_mode=4 then 1 else 0 end)
			from ticket
			where created_timestamp>=unix_timestamp(?) and created_timestamp<unix_timestamp(?)
			and
			status =7
			group by device_serial
			order by created_timestamp desc;
			`
			r = common.SodaDB_R.Raw(sql, date, after)
		} else {
			sql = `
			select month,
			sum(total_amount),
			sum(total_device),
			sum(total_mode_1),
			sum(total_mode_2),
			sum(total_mode_3),
			sum(total_mode_4)
			from monthly_consume
			group by month
			order by month desc;
			`
			r = common.SodaMngDB_R.Raw(sql)
		}
	} else { //普通用户
		if len(date) == 7 {
			sql = `
			select date,
			total_amount,
			total_device,
			total_mode_1,
			total_mode_2,
			total_mode_3,
			total_mode_4
			from daily_consume
			where user_id=?
			and
			created_timestamp
			between
			unix_timestamp(cast(date_format(? ,'%Y-%m-01') as date))
			and
			unix_timestamp(last_day(date_add(date(?), interval 0 month)))
			group by date
			order by date desc;
			`
			r = common.SodaMngDB_R.Raw(sql, userId, date+"-01", date+"-01")
		} else if len(date) == 10 {
			devices, err = deviceService.ListByUserOrderByAddress(userId, page, perPage)
			if err != nil {
				return nil, err
			}
			var serialNumbers []string
			for _, device := range *devices {
				serialNumbers = append(serialNumbers, "'"+device.SerialNumber+"'")
			}
			_serialNumber := strings.Join(serialNumbers, ",")
			t, _ := time.Parse("2006-01-02", date)
			after := t.AddDate(0, 0, 1).Format("2006-01-02")
			data := map[string]interface{}{
				"owner_id":       userId,
				"date":           date,
				"serial_numbers": _serialNumber,
				"after":          after,
			}
			sql = `
			select device_serial,
			sum(value),
			sum(case when device_mode=1 then 1 else 0 end),
			sum(case when device_mode=2 then 1 else 0 end),
			sum(case when device_mode=3 then 1 else 0 end),
			sum(case when device_mode=4 then 1 else 0 end)
			from ticket
			where
			owner_id={{owner_id}}
			and
			device_serial in ({{{serial_numbers}}})
			and
			created_timestamp>=unix_timestamp('{{date}}')
			and
			created_timestamp<unix_timestamp('{{after}}')
			and
			status =7
			group by device_serial
			order by created_timestamp desc;
			`
			sql = mustache.Render(sql, data)
			r = common.SodaDB_R.Raw(sql)
		} else {
			sql = `
			select month,
			total_amount,
			total_device,
			total_mode_1,
			total_mode_2,
			total_mode_3,
			total_mode_4
			from monthly_consume
			where user_id=?
			group by month
			order by month desc;
			`
			r = common.SodaMngDB_R.Raw(sql, userId)
		}
	}
	rows, err := r.Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	if len(date) == 10 {
		results := make(map[string]interface{}, 0)
		for rows.Next() {
			m := make(map[string]interface{}, 0)
			var amount float64 //金额
			var userId int
			var userName string
			var deviceType int
			var serialNumber string
			var address string
			var dc int //模块数
			var dt int //单脱
			var kx int //快洗
			var bz int //标准
			var dw int //大物
			err := rows.Scan(&serialNumber, &amount, &dt, &kx, &bz, &dw)
			if err != nil {
				return nil, err
			}
			m["serialNumber"] = serialNumber
			m["amount"] = amount / 100
			m["money"] = amount / 100
			m["firstPulseAmount"] = dt
			m["secondPulseAmount"] = kx
			m["thirdPulseAmount"] = bz
			m["fourthPulseAmount"] = dw

			m["deviceType"] = deviceType
			m["userId"] = userId
			m["userName"] = userName
			m["address"] = address
			m["deviceCount"] = dc
			results[serialNumber] = m
		}
		for _, device := range *devices {
			m, has := results[device.SerialNumber]
			if has {
				_m := m.(map[string]interface{})
				_m["address"] = device.Address
				list = append(list, &_m)
			} else {
				m := make(map[string]interface{}, 0)
				var amount float64 //金额
				var userId int
				var userName string
				var deviceType int
				var address string
				var dc int //模块数
				var dt int //单脱
				var kx int //快洗
				var bz int //标准
				var dw int //大物
				address = device.Address
				m["serialNumber"] = device.SerialNumber
				m["amount"] = amount / 100
				m["money"] = amount / 100
				m["firstPulseAmount"] = dt
				m["secondPulseAmount"] = kx
				m["thirdPulseAmount"] = bz
				m["fourthPulseAmount"] = dw

				m["deviceType"] = deviceType
				m["userId"] = userId
				m["userName"] = userName
				m["address"] = address
				m["deviceCount"] = dc
				list = append(list, &m)
			}
		}
	} else {
		for rows.Next() {
			m := make(map[string]interface{}, 0)
			var _date string   //日期
			var amount float64 //金额
			var dc int         //模块数
			var dt int         //单脱
			var kx int         //快洗
			var bz int         //标准
			var dw int         //大物
			err := rows.Scan(&_date, &amount, &dc, &dt, &kx, &bz, &dw)
			if err != nil {
				return nil, err
			}
			m["date"] = _date
			m["amount"] = amount / 100
			m["deviceCount"] = dc
			m["firstPulseAmount"] = dt
			m["secondPulseAmount"] = kx
			m["thirdPulseAmount"] = bz
			m["fourthPulseAmount"] = dw
			list = append(list, &m)
		}
	}
	return &list, nil
}

func (self *StatisService) Operate(date string) (*[]*model.DailyOperate, error) {
	list := &[]*model.DailyOperate{}
	var r *gorm.DB
	if len(date) == 7 {
		date = date + "-01"
		r = common.SodaMngDB_R.Where(`
		created_timestamp
		between
		unix_timestamp(cast(date_format(? ,'%Y-%m-01') as date))
		and
		unix_timestamp(last_day(date_add(?, interval 0 month)))
		`, date, date).Order("created_timestamp desc").Find(&list)
	} else if len(date) == 10 {
		r = common.SodaMngDB_R.Where("date = ?", date).Find(list)
	}
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *StatisService) MonthlyOperate() (*[]*model.MonthlyOperate, error) {
	list := &[]*model.MonthlyOperate{}
	r := common.SodaMngDB_R.Order("created_timestamp desc").Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *StatisService) Device(userId int, serialNumber string, date string) (*[]*map[string]interface{}, error) {
	list := make([]*map[string]interface{}, 0)
	param := make([]interface{}, 0)
	var err error

	var sql string = ""

	if len(date) == 7 {
		sql = `
		select device_serial, from_unixtime(created_timestamp,'%Y-%m-%d') _date,
		sum(value) totalAmount,
		sum(case when device_mode=1 then 1 else 0 end) totalMode1,
		sum(case when device_mode=2 then 1 else 0 end) totalMode2,
		sum(case when device_mode=3 then 1 else 0 end) totalMode3,
		sum(case when device_mode=4 then 1 else 0 end) totalMode4
		from ticket where owner_id=? and device_serial=? and from_unixtime(created_timestamp,'%Y-%m')=?
		and
		status = 7
		group by from_unixtime(created_timestamp,'%Y-%m-%d')
		order by created_timestamp desc;
		`
	} else if len(date) == 10 {
		sql = `
		select device_serial, from_unixtime(created_timestamp,'%Y-%m-%d') _date,
		value ,
		(case when device_mode=1 then 1 else 0 end),
		(case when device_mode=2 then 1 else 0 end),
		(case when device_mode=3 then 1 else 0 end),
		(case when device_mode=4 then 1 else 0 end)
		from ticket where owner_id=? and device_serial=? and from_unixtime(created_timestamp,'%Y-%m-%d')=?
		and
		status = 7
		order by created_timestamp desc;
		`
	} else {
		sql = `
		select device_serial, from_unixtime(created_timestamp,'%Y-%m') _month,
		sum(value) totalAmount,
		sum(case when device_mode=1 then 1 else 0 end) totalMode1,
		sum(case when device_mode=2 then 1 else 0 end) totalMode2,
		sum(case when device_mode=3 then 1 else 0 end) totalMode3,
		sum(case when device_mode=4 then 1 else 0 end) totalMode4
		from ticket where owner_id=?
		and
		status = 7
		group by from_unixtime(created_timestamp,'%Y-%m'),device_serial
		order by created_timestamp desc
		`
	}

	param = append(param, userId)

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
	rows, err := common.SodaDB_R.Raw(sql, param...).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	deviceService := &DeviceService{}
	devices, err := deviceService.ListByUserId(userId)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		m := make(map[string]interface{}, 0)
		var _date string
		var deviceno string
		var address string
		var money float64
		var dt int
		var kx int
		var bz int
		var dw int

		err := rows.Scan(&deviceno, &_date, &money, &dt, &kx, &bz, &dw)
		if err != nil {
			return nil, err
		}
		for _, device := range *devices {
			if deviceno == device.SerialNumber {
				address = device.Address
			}
		}
		m["date"] = _date
		m["serialNumber"] = deviceno
		m["firstPulseAmount"] = dt
		m["secondPulseAmount"] = kx
		m["thirdPulseAmount"] = bz
		m["fourthPulseAmount"] = dw
		m["amount"] = money / 100
		m["address"] = address
		list = append(list, &m)
	}
	return &list, nil
}

func (self *StatisService) BalanceSum() (float64, error) {
	var s float64
	sql := "select ifnull(sum(total_recharge-total_consume),0) from daily_operate"
	err := common.SodaMngDB_R.Raw(sql).Row().Scan(&s)
	if err != nil {
		return float64(0), err
	}
	return s, nil
}

func (self *StatisService) Recharge(start string, end string) (map[string]float64, error) {
	data := make(map[string]float64, 0)
	sql := `
	select date_format(date,'%Y-%m-%d') as 'date',total_recharge as recharge
	from daily_operate
	where
	date_format(date,'%Y-%m-%d') between ? and ?
	order by
	created_timestamp desc
	`
	rows, err := common.SodaMngDB_R.Raw(sql, start, end).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var date string
		var recharge float64
		err := rows.Scan(&date, &recharge)
		if err != nil {
			return nil, err
		}
		data[date] = recharge / 100
	}
	common.Logger.Debug("recharge=========", data)
	return data, nil
}

func (self *StatisService) RechargeSum() (float64, error) {
	var s float64
	sql := "select sum(total_recharge) from daily_operate"
	err := common.SodaMngDB_R.Raw(sql).Row().Scan(&s)
	if err != nil {
		return float64(0), err
	}
	return s, nil
}

func (self *StatisService) Consumption(start string, end string) (map[string]float64, error) {
	data := make(map[string]float64, 0)
	sql := `
	select date_format(date,'%Y-%m-%d') as 'date',total_consume as consume
	from daily_operate
	where
	date_format(date,'%Y-%m-%d') between ? and ?
	order by
	created_timestamp desc
	`
	rows, err := common.SodaMngDB_R.Raw(sql, start, end).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var date string
		var consume float64

		err := rows.Scan(&date, &consume)
		if err != nil {
			return nil, err
		}
		data[date] = consume / 100
	}
	common.Logger.Debug("consumption=========", data)
	return data, nil
}

func (self *StatisService) ConsumptionSum() (float64, error) {
	var s float64
	sql := "select sum(total_consume) from daily_operate"
	err := common.SodaMngDB_R.Raw(sql).Row().Scan(&s)
	if err != nil {
		return float64(0), err
	}
	return s, nil
}

func (self *StatisService) FailedTrade() (*[]*map[string]interface{}, error) {
	list := make([]*map[string]interface{}, 0)
	sql := "select date(inserttime) as 'date',count(*) as 'count' from trade_info where tradestatus='' and date(inserttime)>='2016-01-01' group by date(inserttime)"
	rows, err := common.SodaMngDB_R.Raw(sql).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		m := make(map[string]interface{}, 0)
		var date string
		var count int

		err := rows.Scan(&date, &count)
		if err != nil {
			return nil, err
		}
		m["date"] = date
		m["count"] = count
		list = append(list, &m)
	}
	return &list, nil
}
