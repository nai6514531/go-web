package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/model/muniu"
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

func (self *DeviceService) ListByUserAndSchool(userId int, schoolId int, page int, perPage int) (*[]*model.Device, error) {
	list := &[]*model.Device{}
	r := common.DB.Offset((page-1)*perPage).Limit(perPage).Where("user_id = ? and school_id = ?", userId, schoolId).Order("id desc").Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *DeviceService) TotalByByUserAndSchool(userId int, schoolId int) (int, error) {
	device := &model.Device{}
	var total int
	r := common.DB.Model(device).Where("user_id = ? and school_id = ?", userId, schoolId).Count(&total)
	if r.Error != nil {
		return 0, r.Error
	}
	return total, nil
}

func (self *DeviceService) Create(device *model.Device) bool {
	transAction := common.DB.Begin()
	r := transAction.Create(device).Scan(device)
	if r.RowsAffected <= 0 || r.Error != nil {
		return false
	}
	//更新到木牛数据库
	boxInfo := &muniu.BoxInfo{}
	boxInfo.FillByDevice(device)
	r = common.MNDB.Create(boxInfo)
	if r.RowsAffected <= 0 || r.Error != nil {
		common.Logger.Warningln("MNDB Create BoxInfo:", r.Error.Error())
		transAction.Rollback()
		return false
	}
	transAction.Commit()
	return true
}

func (self *DeviceService) Update(device model.Device) bool {
	transAction := common.DB.Begin()
	r := transAction.Model(&model.Device{}).Where("id = ?", device.Id).Updates(device).Scan(&device)
	if r.RowsAffected <= 0 || r.Error != nil {
		return false
	}
	//更新到木牛数据库
	boxInfo := &muniu.BoxInfo{}
	boxInfo.FillByDevice(&device)
	r = common.MNDB.Model(&muniu.BoxInfo{}).Where("DEVICENO = ?", boxInfo.DeviceNo).Updates(device)
	if r.Error != nil {
		common.Logger.Warningln("MNDB Update BoxInfo:", r.Error.Error())
		transAction.Rollback()
		return false
	}
	transAction.Commit()
	return true
}

func (self *DeviceService) UpdateStatus(device model.Device) bool {
	transAction := common.DB.Begin()
	r := transAction.Model(&model.Device{}).Where("id = ?", device.Id).Update("status", device.Status).Scan(&device)
	if r.RowsAffected <= 0 || r.Error != nil {
		return false
	}
	//更新到木牛数据库
	boxInfo := &muniu.BoxInfo{}
	boxInfo.FillByDevice(&device)
	r = common.MNDB.Model(&muniu.BoxInfo{}).Where("DEVICENO = ?", boxInfo.DeviceNo).Update("STATUS", boxInfo.Status)
	if r.RowsAffected <= 0 || r.Error != nil {
		common.Logger.Warningln("MNDB Update BoxInfo-STATUS:", r.Error.Error())
		transAction.Rollback()
		return false
	}
	transAction.Commit()
	return true
}

func (self *DeviceService) UpdateBySerialNumber(device *model.Device) bool {
	transAction := common.DB.Begin()
	r := transAction.Model(&model.Device{}).Where("serial_number = ?", device.SerialNumber).Updates(device).Scan(device)
	if r.RowsAffected <= 0 || r.Error != nil {
		return false
	}
	//更新到木牛数据库
	boxInfo := &muniu.BoxInfo{}
	boxInfo.FillByDevice(device)
	r = common.MNDB.Model(&muniu.BoxInfo{}).Where("DEVICENO = ?", boxInfo.DeviceNo).Update(boxInfo)
	if r.RowsAffected <= 0 || r.Error != nil {
		transAction.Rollback()
		common.Logger.Warningln("MNDB Update BoxInfo-BY-DEVICENO:", r.Error.Error())
		return false
	}
	transAction.Commit()
	return true
}

func (self *DeviceService) Reset(id int) bool {
	device := &model.Device{}
	transAction := common.DB.Begin()
	r := transAction.Model(&model.Device{}).Where("id = ?", id).Update("user_id", 0).Scan(device)
	if r.RowsAffected <= 0 || r.Error != nil {
		return false
	}
	//重置，在木牛数据库
	boxInfo := &muniu.BoxInfo{}
	boxInfo.FillByDevice(device)
	r = common.MNDB.Model(&muniu.BoxInfo{}).Where("DEVICENO = ?", boxInfo.DeviceNo).Update("COMPANYID", "0")
	if r.RowsAffected <= 0 || r.Error != nil {
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
	if r.RowsAffected <= 0 || r.Error != nil {
		return false
	}
	//重置，在木牛数据库
	boxInfo := &muniu.BoxInfo{}
	boxInfo.FillByDevice(device)
	r = common.MNDB.Where("DEVICENO = ?", boxInfo.DeviceNo).Delete(&muniu.BoxInfo{})
	if r.RowsAffected <= 0 || r.Error != nil {
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
