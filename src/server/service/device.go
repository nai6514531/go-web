package service

import (
	"fmt"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/model/muniu"
	"time"
	"github.com/spf13/viper"
	"github.com/jinzhu/gorm"
)

type DeviceService struct {
}

func (self *DeviceService) Basic(id int) (*model.Device, error) {
	device := &model.Device{}
	r := common.DB.Where("id = ?", id).First(device)
	if r.Error != nil {
		return nil, r.Error
	}
	return device, nil
}

func (self *DeviceService) BasicBySerialNumber(serialNumber string) (*model.Device, error) {
	device := &model.Device{}
	r := common.DB.Where("serial_number = ?", serialNumber).First(device)
	if r.Error != nil {
		return nil, r.Error
	}
	return device, nil
}

func (self *DeviceService) ListBySerialNumber(userId int, schoolId int, serialNumber ...string) (*[]*model.Device, error) {
	list := &[]*model.Device{}
	params := make([]interface{}, 0)
	sql := "user_id = ? and "
	params = append(params, userId)
	if schoolId != -1 {
		sql += " school_id = ? and "
		params = append(params, schoolId)
	}
	sql += " serial_number in (?)"
	params = append(params, serialNumber)
	r := common.DB.Where(sql, params...).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *DeviceService) List(page int, perPage int) (*[]*model.Device, error) {
	list := &[]*model.Device{}
	r := common.DB.Offset((page - 1) * perPage).Limit(perPage).Order("id desc").Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *DeviceService) Total() (int, error) {
	var total int
	r := common.DB.Model(&model.Device{}).Count(&total)
	if r.Error != nil {
		return 0, r.Error
	}
	return total, nil
}

func (self *DeviceService) TotalByUser(userId int) (int, error) {
	device := &model.Device{}
	var total int
	r := common.DB.Model(device).Where("user_id = ?", userId).Count(&total)
	if r.Error != nil {
		return 0, r.Error
	}
	return total, nil
}

func (self *DeviceService) TotalByUserAndNextLevel(user *model.User, serialNumber string, userQuery string) (int, error) {
	var total int
	params := make([]interface{}, 0)

	sql := ""
	if userQuery != "" {
		sql = " select count(*) as total from device d, user u where 1=1 "
	} else {
		sql = " select count(*) as total from device d where 1=1 "
	}
	if user.Id == 1 {
		sql += " and (user_id = ? or from_user_id= ? or has_retrofited = 1) "
	} else {
		sql += " and (user_id = ? or from_user_id= ? and has_retrofited = 0) "
	}
	params = append(params, user.Id, user.Id)
	if serialNumber != "" {
		sql += " and d.serial_number like ? "
		params = append(params, "%" + serialNumber + "%")
	} else if userQuery != "" {
		sql += " and ( (u.id=d.user_id /*or u.id=d.from_user_Id*/) and (u.name like ? or u.account like ? or u.contact like ? ) ) "
		params = append(params, "%" + userQuery + "%", "%" + userQuery + "%", "%" + userQuery + "%")
	}
	r := common.DB.Raw(sql, params...).Count(&total)
	if r.Error != nil {
		return 0, r.Error
	}
	return total, nil
}

func (self *DeviceService) ListByUserAndNextLevel(user *model.User, serialNumber string, userQuery string, page int, perPage int) (*[]*model.Device, error) {
	list := make([]*model.Device, 0)
	params := make([]interface{}, 0)
	sql := ""
	if userQuery != "" {
		sql = " select u.name as user_name, d.* from device d, user u where 1=1 "
	} else {
		sql = " select d.* from device d where 1=1 "
	}
	if user.Id == 1 {
		sql += " and (user_id = ? or from_user_id= ? or has_retrofited = 1) "
	} else {
		sql += " and (user_id = ? or from_user_id= ? and has_retrofited = 0) "
	}
	params = append(params, user.Id, user.Id)
	if serialNumber != "" {
		sql += " and d.serial_number like ? "
		params = append(params, "%" + serialNumber + "%")
	} else if userQuery != "" {
		sql += " and ( (u.id=d.user_id /*or u.id=d.from_user_Id*/) and (u.name like ? or u.account like ? or u.contact like ? ) ) "
		params = append(params, "%" + userQuery + "%", "%" + userQuery + "%", "%" + userQuery + "%")
	}
	//测试按设备编号排序
	if user.Id == 1 {
		sql += " order by case when user_id=? then 1 else 2 end asc, serial_number desc limit ? offset ?"
	}else{//其它用户按楼层排序
		sql += " order by case when user_id=? then 1 else 2 end asc, address desc, id desc limit ? offset ?"
	}
	params = append(params, user.Id, perPage, (page - 1) * perPage)
	rows, err := common.DB.Raw(sql, params...).Rows()
	defer rows.Close()
	if err != nil {
		common.Logger.Debug("-----------------", err.Error())
		return nil, err
	}
	for rows.Next() {
		device := &model.Device{}
		common.DB.ScanRows(rows, device)
		list = append(list, device)

	}
	return &list, nil
}

func (self *DeviceService) ListByUser(userId int, page int, perPage int) (*[]*model.Device, error) {
	list := &[]*model.Device{}
	//limit perPage offset (page-1)*perPage
	r := common.DB.Offset((page - 1) * perPage).Limit(perPage).Where("user_id = ?", userId).Order("id desc").Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *DeviceService) ListBySerialNumbers(serialNumbers string) (*[]*model.Device, error) {
	list := &[]*model.Device{}
	r := common.DB.Where("serial_number in (?) ", serialNumbers).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *DeviceService) ListByUserAndSerialNumbers(userId int, serialNumbers []string) (*[]*model.Device, error) {
	list := &[]*model.Device{}
	r := common.DB.Where("user_id = ? and serial_number in (?) ", userId, serialNumbers).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *DeviceService) ListByUserAndSchool(userId int, schoolId int, page int, perPage int, serialNums ...string) (*[]*model.Device, error) {
	list := &[]*model.Device{}
	params := make([]interface{}, 0)
	sql := "user_id = ? and school_id = ?"
	params = append(params, userId, schoolId)
	if len(serialNums) > 0 && serialNums[0] != "" {
		sql += " and serial_number in (?)"
		params = append(params, serialNums)
	}
	r := common.DB.Offset((page - 1) * perPage).Limit(perPage).Where(sql, params...).Order("id desc").Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *DeviceService) TotalByByUserAndSchool(userId int, schoolId int, serialNums ...string) (int, error) {
	device := &model.Device{}
	var total int
	params := make([]interface{}, 0)
	sql := "user_id = ? and school_id = ?"
	params = append(params, userId, schoolId)

	if len(serialNums) > 0 && serialNums[0] != "" {
		sql += " and serial_number in (?)"
		params = append(params, serialNums)
	}
	r := common.DB.Model(device).Where(sql, params...).Count(&total)
	if r.Error != nil {
		return 0, r.Error
	}
	return total, nil
}

func (self *DeviceService) Create(device *model.Device) bool {
	transAction := common.DB.Begin()
	r := transAction.Create(device).Scan(device)
	if r.Error != nil {
		common.Logger.Warningln("DB Create BoxInfo:", r.Error.Error())
		transAction.Rollback()
		return false
	}
	//更新到木牛数据库
	boxInfo := &muniu.BoxInfo{}
	boxInfo.FillByDevice(device)
	r = common.MNDB.Create(boxInfo)
	if r.Error != nil {
		common.Logger.Warningln("MNDB Create BoxInfo:", r.Error.Error())
		transAction.Rollback()
		return false
	}
	transAction.Commit()
	return true
}

func (self *DeviceService) Update(device model.Device) bool {
	transAction := common.DB.Begin()
	mnTransAction := common.MNDB.Begin()
	//==========================更新到新数据库========================
	r := transAction.Model(&model.Device{}).Where("id = ?", device.Id).Updates(device)
	if r.Error != nil {
		common.Logger.Warningln("DB Update Device:", r.Error.Error())
		transAction.Rollback()
		mnTransAction.Rollback()
		return false
	}
	//再次单独更新几个价格避免价格为0的时候不能更新成功
	var device_zero = make(map[string]interface{})
	device_zero["first_pulse_price"] = device.FirstPulsePrice
	device_zero["second_pulse_price"] = device.SecondPulsePrice
	device_zero["third_pulse_price"] = device.ThirdPulsePrice
	device_zero["fourth_pulse_price"] = device.FourthPulsePrice
	//避免schoolId为0时不更新
	device_zero["school_id"] = device.SchoolId
	device_zero["province_id"] = device.ProvinceId
	device_zero["address"] = device.Address
	r = transAction.Model(&model.Device{}).Where("id = ?", device.Id).Updates(device_zero).Scan(&device)
	if r.Error != nil {
		common.Logger.Warningln("DB Update DevicePrice:", r.Error.Error())
		transAction.Rollback()
		mnTransAction.Rollback()
		return false
	}
	//================更新到木牛数据库======================
	boxInfo := &muniu.BoxInfo{}
	boxInfo.FillByDevice(&device)
	r = mnTransAction.Model(&muniu.BoxInfo{}).Where("DEVICENO = ?", boxInfo.DeviceNo).Updates(boxInfo)
	if r.Error != nil {
		common.Logger.Warningln("MNDB Update BoxInfo:", r.Error.Error())
		transAction.Rollback()
		mnTransAction.Rollback()
		return false
	}
	//再次单独更新几个价格避免价格为0的时候不能更新成功
	var boxInfoPrice = make(map[string]interface{})
	boxInfoPrice["PRICE_601"] = boxInfo.Price_601
	boxInfoPrice["PRICE_602"] = boxInfo.Price_602
	boxInfoPrice["PRICE_603"] = boxInfo.Price_603
	boxInfoPrice["PRICE_604"] = boxInfo.Price_604
	boxInfoPrice["ADDRESS"] = boxInfo.Address
	r = mnTransAction.Model(&muniu.BoxInfo{}).Where("DEVICENO = ?", boxInfo.DeviceNo).Updates(boxInfoPrice)
	if r.Error != nil {
		common.Logger.Warningln("DB Update DevicePrice:", r.Error.Error())
		transAction.Rollback()
		mnTransAction.Rollback()
		return false
	}
	//======================================================
	transAction.Commit()
	mnTransAction.Commit()
	return true
}

func (self *DeviceService) UpdatePulseName(device model.Device) bool {
	transAction := common.DB.Begin()
	mnTransAction := common.MNDB.Begin()
	//==========================更新到新数据库========================
	r := transAction.Model(&model.Device{}).Where("id = ?", device.Id).Updates(device)
	if r.Error != nil {
		common.Logger.Warningln("DB UpdatePulseName Device:", r.Error.Error())
		transAction.Rollback()
		mnTransAction.Rollback()
		return false
	}
	//================更新到木牛数据库======================
	boxInfo := &muniu.BoxInfo{}
	boxInfo.FillByDevice(&device)
	r = mnTransAction.Model(&muniu.BoxInfo{}).Where("DEVICENO = ?", boxInfo.DeviceNo).Updates(boxInfo)
	if r.Error != nil {
		common.Logger.Warningln("MNDB Update BoxInfo:", r.Error.Error())
		transAction.Rollback()
		mnTransAction.Rollback()
		return false
	}
	//======================================================
	transAction.Commit()
	mnTransAction.Commit()
	return true
}

func (self *DeviceService) UpdateStatus(device model.Device) bool {
	transAction := common.DB.Begin()
	r := transAction.Model(&model.Device{}).Where("id = ?", device.Id).Update("status", device.Status).Scan(&device)
	if r.Error != nil {
		common.Logger.Warningln("DB Update BoxInfo-STATUS:", r.Error.Error())
		transAction.Rollback()
		return false
	}
	//更新到木牛数据库
	boxInfo := &muniu.BoxInfo{}
	boxInfo.FillByDevice(&device)
	r = common.MNDB.Model(&muniu.BoxInfo{}).Where("DEVICENO = ?", boxInfo.DeviceNo).Update("STATUS", boxInfo.Status)
	if r.Error != nil {
		common.Logger.Warningln("MNDB Update BoxInfo-STATUS:", r.Error.Error())
		transAction.Rollback()
		return false
	}
	transAction.Commit()
	return true
}

func (self *DeviceService) UpdateBySerialNumber(device *model.Device) bool {
	transAction := common.DB.Begin()
	mnTransAction := common.MNDB.Begin()
	r := transAction.Model(&model.Device{}).Where("serial_number = ?", device.SerialNumber).Updates(device)
	if r.Error != nil {
		common.Logger.Warningln("DB Update BoxInfo-BY-DEVICENO:", r.Error.Error())
		transAction.Rollback()
		mnTransAction.Rollback()
		return false
	}
	//再单独更新一次学校id因为传入的学校id可以为0
	r = transAction.Model(&model.Device{}).Where("serial_number = ?", device.SerialNumber).Update("school_id", device.SchoolId).Scan(device)
	if r.Error != nil {
		common.Logger.Warningln("DB Update BoxInfo-BY-DEVICENO:", r.Error.Error())
		transAction.Rollback()
		mnTransAction.Rollback()
		return false
	}
	//更新到木牛数据库
	boxInfo := &muniu.BoxInfo{}
	boxInfo.FillByDevice(device)
	r = mnTransAction.Model(&muniu.BoxInfo{}).Where("DEVICENO = ?", boxInfo.DeviceNo).Update(boxInfo)
	if r.Error != nil {
		transAction.Rollback()
		mnTransAction.Rollback()
		common.Logger.Warningln("MNDB Update BoxInfo-BY-DEVICENO:", r.Error.Error())
		return false
	}
	//单独更新一次学校id
	transAction.Commit()
	mnTransAction.Commit()
	return true
}

func (self *DeviceService) BatchUpdateBySerialNumber(device *model.Device, serialList []string) bool {
	transAction := common.DB.Begin()
	mnTransAction := common.MNDB.Begin()
	device.SerialNumber = "" //不更新这个字段
	r := transAction.Model(&model.Device{}).Where("serial_number IN (?)", serialList).Updates(device)
	if r.Error != nil {
		common.Logger.Warningln("DB Update BoxInfo-BY-DEVICENO:", r.Error.Error())
		transAction.Rollback()
		mnTransAction.Rollback()
		return false
	}
	//再单独更新一次可能为0的值，学校id，4个单洗价格
	var zeroValue = make(map[string]interface{})
	zeroValue["school_id"] = device.SchoolId
	zeroValue["first_pulse_price"] = device.FirstPulsePrice
	zeroValue["second_pulse_price"] = device.SecondPulsePrice
	zeroValue["third_pulse_price"] = device.ThirdPulsePrice
	zeroValue["fourth_pulse_price"] = device.FourthPulsePrice
	r = transAction.Model(&model.Device{}).Where("serial_number IN (?)", serialList).Updates(zeroValue).First(device)
	if r.Error != nil {
		common.Logger.Warningln("DB Update BoxInfo-BY-DEVICENO:", r.Error.Error())
		transAction.Rollback()
		mnTransAction.Rollback()
		return false
	}
	device.SerialNumber = "" //不更新这个字段
	//更新到木牛数据库
	boxInfo := &muniu.BoxInfo{}
	boxInfo.FillByDevice(device)
	r = mnTransAction.Model(&muniu.BoxInfo{}).Where("DEVICENO IN (?)", serialList).Update(boxInfo)
	if r.Error != nil {
		transAction.Rollback()
		mnTransAction.Rollback()
		common.Logger.Warningln("MNDB Update BoxInfo-BY-DEVICENO:", r.Error.Error())
		return false
	}
	//再次单独更新几个价格避免价格为0的时候不能更新成功
	var boxInfoPrice = make(map[string]interface{})
	boxInfoPrice["PRICE_601"] = boxInfo.Price_601
	boxInfoPrice["PRICE_602"] = boxInfo.Price_602
	boxInfoPrice["PRICE_603"] = boxInfo.Price_603
	boxInfoPrice["PRICE_604"] = boxInfo.Price_604
	r = mnTransAction.Model(&muniu.BoxInfo{}).Where("DEVICENO IN (?)", serialList).Updates(boxInfoPrice)
	if r.Error != nil {
		common.Logger.Warningln("DB Update DevicePrice:", r.Error.Error())
		transAction.Rollback()
		mnTransAction.Rollback()
		return false
	}
	transAction.Commit()
	mnTransAction.Commit()
	return true
}

func (self *DeviceService) Reset(id int, user *model.User) bool {
	device := &model.Device{}
	transAction := common.DB.Begin()
	data := map[string]interface{}{
		"user_id":          1,
		"from_user_id":     user.Id,
		"status":           9,
		"has_retrofited":   1,
	}
	r := transAction.Model(&model.Device{}).Where("id = ?", id).Updates(data).Scan(device)
	if r.Error != nil {
		common.Logger.Warningln("DB Update BoxInfo-Reset:", r.Error.Error())
		transAction.Rollback()
		return false
	}
	//重置，在木牛数据库
	boxInfo := &muniu.BoxInfo{}
	boxInfo.FillByDevice(device)
	r = common.MNDB.Model(&muniu.BoxInfo{}).Where("DEVICENO = ?", boxInfo.DeviceNo).Updates(map[string]interface{}{"COMPANYID": "0", "STATUS": "9"})
	if r.Error != nil {
		transAction.Rollback()
		common.Logger.Warningln("MNDB Update BoxInfo-Reset:", r.Error.Error())
		return false
	}
	transAction.Commit()
	return true
}

func (self *DeviceService) Delete(id int) bool {
	device := &model.Device{}
	transAction := common.DB.Begin()
	//硬删除记录
	r := transAction.Model(&model.Device{}).Where("id = ?", id).Scan(device).Unscoped().Delete(&model.Device{})
	if r.Error != nil {
		common.Logger.Warningln("DB Delete BoxInfo:", r.Error.Error())
		transAction.Rollback()
		return false
	}
	//重置，在木牛数据库
	boxInfo := &muniu.BoxInfo{}
	boxInfo.FillByDevice(device)
	r = common.MNDB.Where("DEVICENO = ?", boxInfo.DeviceNo).Delete(&muniu.BoxInfo{})
	if r.Error != nil {
		transAction.Rollback()
		common.Logger.Warningln("MNDB Delete BoxInfo:", r.Error.Error())
		return false
	}
	transAction.Commit()
	return true
}

func (self *DeviceService) ListSchoolIdByUser(userId int) (*[]int, error) {
	var schoolList []int
	type MyDevice struct {
		SchoolId int `json:"school_id"`
	}
	lists := &[]*MyDevice{}
	//带去重
	r := common.DB.Raw("SELECT DISTINCT school_id FROM device WHERE user_id = ? AND deleted_at IS NULL", userId).Scan(lists)
	if r.Error != nil {
		return nil, r.Error
	}
	//赋值到数组
	for _, list := range *lists {
		schoolList = append(schoolList, list.SchoolId)
	}
	return &schoolList, nil
}

//通过用户列表计算一个有多少个设备
func (self *DeviceService) TotalByUserIds(userIds []int) (int, error) {
	//list := &[]*model.Device{}
	var total int64
	r := common.DB.Model(&model.Device{}).Where("user_id IN (?)", userIds).Count(&total)
	if r.Error != nil {
		return 0, r.Error
	}
	return int(total), nil
}

//判断这批设备序列号是否都是属于test用户或者自身用户的
func (self *DeviceService) IsOwntoMeOrTest(userId int, serialList []string) bool {
	var total int64
	r := common.DB.Model(&model.Device{}).Where("user_id IN (1,?) AND serial_number IN (?)", userId, serialList).Count(&total)
	if r.Error != nil {
		common.Logger.Warningln(r.Error)
		return false
	}
	if int(total) == len(serialList) {
		return true
	} else {
		return false
	}
}

//判断这一批序列号要不还没注册要不还没录入
func (self *DeviceService) IsNoExist(serialList []string) bool {
	var total int64
	r := common.DB.Model(&model.Device{}).Where("serial_number IN (?)", serialList).Count(&total)
	if r.Error != nil {
		common.Logger.Warningln(r.Error)
		return false
	}
	if total == 0 {
		return true
	} else {
		return false
	}
}

func (self *DeviceService) BatchCreateBySerialNum(device *model.Device, serialList []string) error {
	transAction := common.DB.Begin()
	mnTransAction := common.MNDB.Begin()
	device.UserId = 1 //添加的设备userid为1
	device.CreatedAt = time.Now()
	step := viper.GetInt("device.step")
	device.Step = step
	sql := "INSERT INTO device (user_id,label,step,serial_number,reference_device_id,province_id,city_id,district_id,school_id,address,first_pulse_price,second_pulse_price,third_pulse_price,fourth_pulse_price,first_pulse_name,second_pulse_name,third_pulse_name,fourth_pulse_name,status,created_at,updated_at) VALUES "
	for k, serial := range serialList {
		val := fmt.Sprintf("(%d,'%s',%d,'%s',%d,%d,%d,%d,%d,'%s',%d,%d,%d,%d,'%s','%s','%s','%s',%d,'%s','%s')", device.UserId, device.Label, step, serial, device.ReferenceDeviceId, device.ProvinceId, device.CityId, device.DistrictId, device.SchoolId, device.Address, device.FirstPulsePrice, device.SecondPulsePrice, device.ThirdPulsePrice, device.FourthPulsePrice, device.FirstPulseName, device.SecondPulseName, device.ThirdPulseName, device.FourthPulseName, device.Status, device.CreatedAt, device.UpdatedAt)
		sql = sql + val
		if k != len(serialList) - 1 {
			sql = sql + ","
		}
	}
	r := transAction.Exec(sql)
	if r.Error != nil {
		common.Logger.Warningln(r.Error)
		transAction.Rollback()
		mnTransAction.Rollback()
		return r.Error
	}
	//更新到木牛
	boxInfo := &muniu.BoxInfo{}
	boxInfo.FillByDevice(device)
	mnsql := "INSERT INTO box_info (DEVICENO,COMPANYID,STATUS,PASSWORD,LOCATION,INSERTTIME,UPDATETIME,ADDRESS,PRICE_601,PRICE_602,PRICE_603,PRICE_604,DEVICETYPE) VALUES "
	for k, serial := range serialList {
		val := fmt.Sprintf("('%s',%d,'%s','%s',%d,'%s','%s','%s',%f,%f,%f,%f,'%s')", serial, boxInfo.CompanyId, boxInfo.Status, boxInfo.Password, boxInfo.Location, boxInfo.InsertTime, boxInfo.UpdateTime, boxInfo.Address, boxInfo.Price_601, boxInfo.Price_602, boxInfo.Price_603, boxInfo.Price_604, boxInfo.DeviceType)
		mnsql = mnsql + val
		if k != len(serialList) - 1 {
			mnsql = mnsql + ","
		}
	}
	r = mnTransAction.Exec(mnsql)
	if r.Error != nil {
		common.Logger.Warningln(r.Error)
		transAction.Rollback()
		mnTransAction.Rollback()
		return r.Error
	}
	transAction.Commit()
	mnTransAction.Commit()
	return nil
}

func (self *DeviceService) ListByUserId(userId ...int) (*[]*model.Device, error) {
	list := []*model.Device{}
	r := common.DB.Model(&model.Device{}).Where("user_id in (?)", userId).Find(&list)
	if r.Error != nil {
		return nil, r.Error
	}
	return &list, nil
}

func (self *DeviceService) DailyBill(serialNumber string, billAt string, page int, perPage int) (*[]*map[string]interface{}, error) {
	sql := "select b.address,bw.price,bw.usermobile mobile,bw.washtype,bw.INSERTTIME createdAt " +
		" from box_wash bw,box_info b " +
		"where  b.deviceno='" + serialNumber + "' and date(bw.inserttime)='" + billAt + "' and bw.deviceno=b.DEVICENO"
	rows, err := common.MNDB.Raw(sql).Rows()
	if err != nil {
		return nil, err
	}

	list := make([]*map[string]interface{}, 0)
	for rows.Next() {
		var address string
		var price float64
		var mobile string
		var washtype int
		var createdAt string

		err := rows.Scan(&address, &price, &mobile, &washtype, &createdAt)
		if err != nil {
			return nil, err
		}
		m := map[string]interface{}{
			"serialNumber": serialNumber,
			"address":      address,
			"price":        price,
			"mobile":       mobile,
			"washType":     washtype,
			"createdAt":    createdAt,
		}
		list = append(list, &m)
	}

	return &list, nil
}

func (self *DeviceService) BasicByUserId(userId int) (*model.Device, error) {
	device := &model.Device{}
	r := common.DB.Model(&model.Device{}).Where("user_id = ?", userId).First(device)
	if r.Error != nil {
		return nil, r.Error
	}
	return device, nil
}

func (self *DeviceService) BasicMapByUserId(userId ...int) (map[string]*model.Device, error) {
	list := []*model.Device{}
	deviceMap := make(map[string]*model.Device, 0)
	r := common.DB.Model(&model.Device{}).Where("user_id in (?)", userId).Find(&list)
	if r.Error != nil {
		return nil, r.Error
	}
	for _, _device := range list {
		deviceMap[_device.SerialNumber] = _device
	}
	return deviceMap, nil
}

func (self *DeviceService) Assign(toUser *model.User, fromUser *model.User, serialNumbers []string) (bool, error) {
	transAction := common.DB.Begin()
	mnTransAction := common.MNDB.Begin()
	assignedAt := time.Now().Local().Format("2006-01-02 15:04:05")
	data := map[string]interface{}{
		"user_id":        toUser.Id,
		"assigned_at":    assignedAt,
		"from_user_id":   fromUser.Id,
		"has_retrofited": 0,
		"status":         0,
	}
	r := transAction.Model(&model.Device{}).Where("serial_number in  (?) ", serialNumbers).Updates(data)
	if r.Error != nil {
		transAction.Rollback()
		common.Logger.Warningln("DB Device Assign:", r.Error.Error())
		return false, r.Error
	}
	_data := map[string]interface{}{
		"COMPANYID": (toUser.Id - 1),
		"UPDATETIME": assignedAt,
		"STATUS":     "0",
	}
	r = mnTransAction.Model(&muniu.BoxInfo{}).Where("DEVICENO in  (?) ", serialNumbers).Updates(_data)
	if r.Error != nil {
		mnTransAction.Rollback()
		transAction.Rollback()
		common.Logger.Warningln("MNDB BoxInfo Assign:", r.Error.Error())
		return false, r.Error
	}

	transAction.Commit()
	mnTransAction.Commit()
	return true, nil
}

func (self *DeviceService) TimedUpdateStatus(status int) (bool, error) {
	var r *gorm.DB
	var err error
	firstTimedDurationStr := viper.GetString("device.firstTimedDuration")
	secondTimedDurationStr := viper.GetString("device.secondTimedDuration")
	thirdTimedDurationStr := viper.GetString("device.thirdTimedDuration")
	fourthTimedDurationStr := viper.GetString("device.fourthTimedDuration")
	firstTimedDuration, err := time.ParseDuration(firstTimedDurationStr)
	if err != nil {
		return false, err
	}
	secondTimedDuration, err := time.ParseDuration(secondTimedDurationStr)
	if err != nil {
		return false, err
	}
	thirdTimedDuration, err := time.ParseDuration(thirdTimedDurationStr)
	if err != nil {
		return false, err
	}
	fourthTimedDuration, err := time.ParseDuration(fourthTimedDurationStr)
	if err != nil {
		return false, err
	}

	switch status {
	case 601:
		_, err = timedUpdateStatus("601", firstTimedDuration)
		break
	case 602:
		_, err = timedUpdateStatus("602", secondTimedDuration)
		break
	case 603:
		_, err = timedUpdateStatus("603", thirdTimedDuration)
		break
	case 604:
		_, err = timedUpdateStatus("604", fourthTimedDuration)
		break
	default:
		return false, r.Error
	}
	if err != nil {
		return false, err
	}

	return true, nil
}

func timedUpdateStatus(status string, timedDuration time.Duration) (bool, error) {
	timeFormat := "2006-01-02 15:04:05"
	r := common.MNDB.Model(&muniu.BoxInfo{}).Where("DEVICETYPE = 0 and STATUS = '" + status + "' and UPDATETIME <= ?", time.Now().Add(timedDuration).Format(timeFormat)).Update("STATUS", '0')
	if r.Error != nil {
		common.Logger.Warningln("Timed Update " + status + " BoxInfo-STATUS:", r.Error.Error())
		return false, r.Error
	}
	r = common.DB.Model(&model.Device{}).Where("reference_device_id = 1 and status = " + status + " and updated_at <= ?", time.Now().Add(timedDuration).Format(timeFormat)).Update("status", 0)
	if r.Error != nil {
		common.Logger.Warningln("Timed Update " + status + " Device-STATUS:", r.Error.Error())
		return false, r.Error
	}
	return true, nil
}
