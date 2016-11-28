package service

import (
	"fmt"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/model/muniu"
	"time"
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

func (self *DeviceService) ListBySerialNumber(serialNumber ...string) (*[]*model.Device, error) {
	list := &[]*model.Device{}
	r := common.DB.Where("serial_number in (?) ", serialNumber).Find(list)
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

func (self *DeviceService) ListByUser(userId int, page int, perPage int) (*[]*model.Device, error) {
	list := &[]*model.Device{}
	//limit perPage offset (page-1)*perPage
	r := common.DB.Offset((page-1)*perPage).Limit(perPage).Where("user_id = ?", userId).Order("id desc").Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *DeviceService) ListByUserAndSchool(userId int, schoolId int, page int, perPage int, deviceStr ...string) (*[]*model.Device, error) {
	list := &[]*model.Device{}
	params := make([]interface{}, 0)
	sql := "user_id = ? and school_id = ?"
	params = append(params, userId, schoolId)
	if len(deviceStr) > 0 && deviceStr[0] != ""{
		sql += " and serial_number in (?)"
		params = append(params, deviceStr)
	}
	r := common.DB.Offset((page-1)*perPage).Limit(perPage).Where(sql, params...).Order("id desc").Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *DeviceService) TotalByByUserAndSchool(userId int, schoolId int, deviceStr ...string) (int, error) {
	device := &model.Device{}
	var total int
	params := make([]interface{}, 0)
	sql := "user_id = ? and school_id = ?"
	params = append(params, userId, schoolId)

	if len(deviceStr) > 0 && deviceStr[0] != ""{
		sql += " and serial_number in (?)"
		params = append(params, deviceStr)
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
	device_zero["firstPulsePrice"] = device.FirstPulsePrice
	device_zero["secondPulsePrice"] = device.SecondPulsePrice
	device_zero["thirdPulsePrice"] = device.ThirdPulsePrice
	device_zero["fourthPulsePrice"] = device.FourthPulsePrice
	//避免schoolId为0时不更新
	device_zero["school_id"] = device.SchoolId
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

func (self *DeviceService) Reset(id int) bool {
	device := &model.Device{}
	transAction := common.DB.Begin()
	r := transAction.Model(&model.Device{}).Where("id = ?", id).Update("user_id", 1).Scan(device)
	if r.Error != nil {
		common.Logger.Warningln("DB Update BoxInfo-Reset:", r.Error.Error())
		transAction.Rollback()
		return false
	}
	//重置，在木牛数据库
	boxInfo := &muniu.BoxInfo{}
	boxInfo.FillByDevice(device)
	r = common.MNDB.Model(&muniu.BoxInfo{}).Where("DEVICENO = ?", boxInfo.DeviceNo).Update("COMPANYID", "0")
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
	sql := "INSERT INTO device (user_id,label,serial_number,reference_device_id,province_id,city_id,district_id,school_id,address,first_pulse_price,second_pulse_price,third_pulse_price,fourth_pulse_price,first_pulse_name,second_pulse_name,third_pulse_name,fourth_pulse_name,status,created_at,updated_at) VALUES "
	for k, serial := range serialList {
		val := fmt.Sprintf("(%d,'%s','%s',%d,%d,%d,%d,%d,'%s',%d,%d,%d,%d,'%s','%s','%s','%s',%d,'%s','%s')", device.UserId, device.Label, serial, device.ReferenceDeviceId, device.ProvinceId, device.CityId, device.DistrictId, device.SchoolId, device.Address, device.FirstPulsePrice, device.SecondPulsePrice, device.ThirdPulsePrice, device.FourthPulsePrice, device.FirstPulseName, device.SecondPulseName, device.ThirdPulseName, device.FourthPulseName, device.Status, device.CreatedAt, device.UpdatedAt)
		sql = sql + val
		if k != len(serialList)-1 {
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
		if k != len(serialList)-1 {
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
