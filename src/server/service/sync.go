package service

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/model/muniu"
	"strconv"
	"time"
)

type SyncService struct {
}

func (self *SyncService) SyncUser() bool {
	list := &[]*muniu.BoxAdmin{}
	syncService := &SyncService{}
	userService := &UserService{}
	r := common.MNDB.Find(list)
	if r.Error != nil {
		common.Logger.Warningln("common.MNDB.Find BoxAdmin List:", r.Error.Error())
		return false
	}
	boo := true
	for _, boxAdmin := range *list {
		if boxAdmin.LocalId > 0 {
			user, err := userService.Basic(boxAdmin.LocalId)
			if user == nil && err != nil {
				boo = syncService.AddBoxAdmin(boxAdmin)
				if !boo {
					common.Logger.Warningln("AddBoxAdmin id:", boxAdmin.LocalId)
					break
				}
			} else {
				boo = syncService.UpdateBoxAdmin(boxAdmin)
				if !boo {
					common.Logger.Warningln("UpdateBoxAdmin id:", boxAdmin.LocalId)
					break
				}
			}
		}
	}
	return boo
}

func (self *SyncService) SyncUserRole() bool {
	list := &[]*muniu.BoxAdmin{}
	syncService := &SyncService{}
	userRoleRelService := &UserRoleRelService{}
	r := common.MNDB.Find(list)
	if r.Error != nil {
		common.Logger.Warningln("common.MNDB.Find BoxAdmin List:", r.Error.Error())
		return false
	}
	boo := true
	for _, boxAdmin := range *list {
		if boxAdmin.LocalId > 0 {
			roleId := 0
			userType, _ := strconv.Atoi(boxAdmin.UserType)
			if userType == 0 {
				roleId = 1 //管理员
			} else if userType == 2 || userType == 4 {
				roleId = 2 //普通后台用户
			} else if userType == 5 {
				roleId = 4 //客服
			} else {
				roleId = userType
			}
			userRoleRel, err := userRoleRelService.BasicByUserIdAndRoleId(boxAdmin.LocalId, roleId)
			if userRoleRel == nil && err != nil {
				boo = syncService.AddUserRoleRel(boxAdmin.LocalId, roleId)
				if !boo {
					common.Logger.Warningln("AddUserRoleRef:", boxAdmin.LocalId, roleId)
					break
				}
			}
		}
	}
	return boo
}

func (self *SyncService) SyncUserCashAccount() bool {
	list := &[]*muniu.BoxAdmin{}
	syncService := &SyncService{}
	userCashAccountService := &UserCashAccountService{}
	r := common.MNDB.Find(list)
	if r.Error != nil {
		common.Logger.Warningln("common.MNDB.Find BoxAdmin List:", r.Error.Error())
		return false
	}
	boo := true
	for _, boxAdmin := range *list {
		if boxAdmin.LocalId > 0 {
			userCashAccount, err := userCashAccountService.BasicByUserId(boxAdmin.LocalId)
			if userCashAccount == nil && err != nil {
				boo = syncService.AddUserCashAccount(boxAdmin)
				if !boo {
					common.Logger.Warningln("AddUserCashAccount id:", boxAdmin.LocalId)
					break
				}
			} else {
				boo = syncService.UpdateUserCashAccount(boxAdmin)
				if !boo {
					common.Logger.Warningln("UpdateUserCashAccount id:", boxAdmin.LocalId)
					break
				}
			}
		}
	}
	return boo
}

func (self *SyncService) SyncDevice() bool {
	list := &[]*muniu.BoxInfo{}
	r := common.MNDB.Find(list)
	syncService := &SyncService{}
	deviceService := &DeviceService{}
	if r.Error != nil {
		common.Logger.Warningln("common.MNDB.Find BoxInfo List:", r.Error.Error())
		return false
	}
	boo := true
	for _, boxInfo := range *list {
		device, err := deviceService.BasicBySerialNumber(boxInfo.DeviceNo)
		if device == nil && err != nil {
			boo = syncService.AddDevice(boxInfo)
			if !boo {
				common.Logger.Warningln("AddDevice DeviceNo:", boxInfo.DeviceNo)
				break
			}
		} else {
			boo = syncService.UpdateDevice(boxInfo)
			if !boo {
				common.Logger.Warningln("UpdateDevice DeviceNo:", boxInfo.DeviceNo)
				break
			}
		}
	}
	return boo
}

func (self *SyncService) SyncDailyBill() bool {
	list := &[]*muniu.BoxStatBill{}
	r := common.MNDB.Where("companyid>0 and status = 0").Find(list)
	syncService := &SyncService{}
	dailyBillService := &DailyBillService{}
	if r.Error != nil {
		common.Logger.Warningln("common.MNDB.Find BoxStatBill List:", r.Error.Error())
		return false
	}
	boo := true
	for _, boxStatBill := range *list {
		dailyBill, err := dailyBillService.BasicByUserIdAndBillAt(boxStatBill.CompanyId, boxStatBill.PeriodStart)
		if dailyBill == nil && err != nil {
			boo = syncService.AddDailyBill(boxStatBill)
			if !boo {
				common.Logger.Warningln("AddDailyBill:", boxStatBill.AgencyId, boxStatBill.PeriodStart)
				break
			}
		} else {
			boo = syncService.UpdateDailyBill(boxStatBill)
			if !boo {
				common.Logger.Warningln("UpdateDailyBill:", boxStatBill.AgencyId, boxStatBill.PeriodStart)
				break
			}
		}
	}
	return boo
}

func (self *SyncService) SyncDailyBillDetail() bool {
	list := &[]*muniu.BoxWash{}
	//最近15个月
	billAt := time.Now().AddDate(0, -15, 0).Format("2006-01-02")
	r := common.MNDB.Where("companyid>0 and date(inserttime)> ?", billAt).Order("localid desc").Find(list)
	syncService := &SyncService{}
	dailyBillDetailService := &DailyBillDetailService{}
	if r.Error != nil {
		common.Logger.Warningln("common.MNDB.Find BoxWash List:", r.Error.Error())
		return false
	}
	hasDeleted, err := dailyBillDetailService.DeleteByBillAt(billAt)
	if !hasDeleted || err != nil {
		return false
	}
	boo := true
	for _, boxWash := range *list {
		boo = syncService.AddDailyBillDetail(boxWash)
		if !boo {
			common.Logger.Warningln("AddDailyBillDetail:", boxWash.UserId, boxWash.DeviceId)
			break
		}
	}
	return boo
}

func (self *SyncService) AddDailyBillDetail(boxWash *muniu.BoxWash) bool {
	//2016-03-14T00:00:10+08:00
	insertTime, _ := time.Parse(time.RFC3339, boxWash.InsertTime)
	billAt := insertTime.Format("2006-01-02 15:04:05");
	pulseType, _ := strconv.Atoi(boxWash.Type)
	dailyBillDetail := &model.DailyBillDetail{
		UserId:       boxWash.UserId,
		SerialNumber: boxWash.DeviceId,
		Amount:       int(boxWash.Price * 100),
		PulseType:    pulseType,
		BillAt:       billAt,
		Status:       boxWash.Status,
	}
	r := common.DB.Create(dailyBillDetail)
	if r.RowsAffected <= 0 || r.Error != nil {
		return false
	}
	return true
}

func (self *SyncService) AddDailyBill(boxStatBill *muniu.BoxStatBill) bool {
	status, _ := strconv.Atoi(boxStatBill.Status)
	dailyBill := &model.DailyBill{
		UserId:      boxStatBill.CompanyId,
		UserName:    boxStatBill.MerchName,
		TotalAmount: int(boxStatBill.Money * 100),
		SettledAt:   boxStatBill.BillDate,
		BillAt:      boxStatBill.PeriodStart,
		OrderCount:  boxStatBill.Times,
		Status:      status,
	}
	r := common.DB.Create(dailyBill)
	if r.RowsAffected <= 0 || r.Error != nil {
		return false
	}
	return true
}

func (self *SyncService) UpdateDailyBill(boxStatBill *muniu.BoxStatBill) bool {
	status, _ := strconv.Atoi(boxStatBill.Status)
	dailyBill := &model.DailyBill{
		UserId:      boxStatBill.CompanyId,
		UserName:    boxStatBill.MerchName,
		TotalAmount: int(boxStatBill.Money * 100),
		SettledAt:   boxStatBill.BillDate,
		BillAt:      boxStatBill.PeriodStart,
		OrderCount:  boxStatBill.Times,
		Status:      status,
	}
	r := common.DB.Model(&model.DailyBill{}).Where("user_id = ? and bill_at = ?", dailyBill.UserId, dailyBill.BillAt).Updates(dailyBill)
	if r.RowsAffected <= 0 || r.Error != nil {
		return false
	}
	return true
}

func (self *SyncService) AddDevice(boxInfo *muniu.BoxInfo) bool {
	status, _ := strconv.Atoi(boxInfo.Status)
	deviceType, _ := strconv.Atoi(boxInfo.DeviceType)
	deviceType += 1
	device := &model.Device{
		UserId:            boxInfo.CompanyId,
		Password:          boxInfo.Password,
		Step:              boxInfo.Location,
		SerialNumber:      boxInfo.DeviceNo,
		ReferenceDeviceId: deviceType,
		Address:           boxInfo.Address,
		FirstPulsePrice:   int(boxInfo.Price_601 * 100),
		SecondPulsePrice:  int(boxInfo.Price_602 * 100),
		ThirdPulsePrice:   int(boxInfo.Price_603 * 100),
		FourthPulsePrice:  int(boxInfo.Price_604 * 100),
		FirstPulseName:    "单洗价格",
		SecondPulseName:   "快洗价格",
		ThirdPulseName:    "标准洗价格",
		FourthPulseName:   "大物洗价格",
		Status:            status,
	}
	r := common.DB.Create(device)
	if r.RowsAffected <= 0 || r.Error != nil {
		return false
	}
	return true
}

func (self *SyncService) UpdateDevice(boxInfo *muniu.BoxInfo) bool {
	status, _ := strconv.Atoi(boxInfo.Status)
	deviceType, _ := strconv.Atoi(boxInfo.DeviceType)
	deviceType += 1
	device := &model.Device{
		UserId:            boxInfo.CompanyId,
		Password:          boxInfo.Password,
		Step:              boxInfo.Location,
		SerialNumber:      boxInfo.DeviceNo,
		ReferenceDeviceId: deviceType,
		Address:           boxInfo.Address,
		FirstPulsePrice:   int(boxInfo.Price_601 * 100),
		SecondPulsePrice:  int(boxInfo.Price_602 * 100),
		ThirdPulsePrice:   int(boxInfo.Price_603 * 100),
		FourthPulsePrice:  int(boxInfo.Price_604 * 100),
		FirstPulseName:    "单洗价格",
		SecondPulseName:   "快洗价格",
		ThirdPulseName:    "标准洗价格",
		FourthPulseName:   "大物洗价格",
		Status:            status,
	}
	r := common.DB.Model(&model.Device{}).Where("serial_number = ?", boxInfo.DeviceNo).Updates(device)
	if r.RowsAffected <= 0 || r.Error != nil {
		return false
	}
	return true
}

func (self *SyncService) AddBoxAdmin(boxAdmin *muniu.BoxAdmin) bool {
	_parentId, _ := strconv.Atoi(boxAdmin.AgencyId)
	user := &model.User{
		Name:      boxAdmin.Name,
		Contact:   boxAdmin.Contact,
		Address:   boxAdmin.Address,
		Account:   boxAdmin.Mobile,
		Password:  boxAdmin.Password,
		Telephone: boxAdmin.ServicePhone,
		ParentId:  _parentId,
	}
	user.Id = boxAdmin.LocalId
	r := common.DB.Create(user)
	if r.RowsAffected <= 0 || r.Error != nil {
		return false
	}
	return true
}

func (self *SyncService) UpdateBoxAdmin(boxAdmin *muniu.BoxAdmin) bool {
	_parentId, _ := strconv.Atoi(boxAdmin.AgencyId)
	user := &model.User{
		Name:      boxAdmin.Name,
		Contact:   boxAdmin.Contact,
		Address:   boxAdmin.Address,
		Account:   boxAdmin.Mobile,
		Password:  boxAdmin.Password,
		Telephone: boxAdmin.ServicePhone,
		ParentId:  _parentId,
	}
	user.Id = boxAdmin.LocalId
	r := common.DB.Save(user)
	if r.RowsAffected <= 0 || r.Error != nil {
		return false
	}
	return true
}

func (self *SyncService) AddUserCashAccount(boxAdmin *muniu.BoxAdmin) bool {
	payType, _ := strconv.Atoi(boxAdmin.PayType)
	payType += 1
	userCashAccount := &model.UserCashAccount{
		UserId:   boxAdmin.LocalId,
		Type:     payType,
		BankName: boxAdmin.BankName,
		Account:  boxAdmin.PayAccount,
		RealName: boxAdmin.PayName,
		Mobile:   boxAdmin.ContactNum,
	}
	r := common.DB.Create(userCashAccount)
	if r.RowsAffected <= 0 || r.Error != nil {
		return false
	}
	return true
}

func (self *SyncService) UpdateUserCashAccount(boxAdmin *muniu.BoxAdmin) bool {
	payType, _ := strconv.Atoi(boxAdmin.PayType)
	payType += 1
	userCashAccount := &model.UserCashAccount{
		UserId:   boxAdmin.LocalId,
		Type:     payType,
		BankName: boxAdmin.BankName,
		Account:  boxAdmin.PayAccount,
		RealName: boxAdmin.PayName,
		Mobile:   boxAdmin.ContactNum,
	}
	r := common.DB.Model(&model.UserCashAccount{}).Where("user_id = ?", userCashAccount.UserId).Updates(userCashAccount)
	if r.RowsAffected <= 0 || r.Error != nil {
		return false
	}
	return true
}

func (self *SyncService) AddUserRoleRel(userId int, roleId int) bool {
	userRoleRel := &model.UserRoleRel{
		UserId: userId,
		RoleId: roleId,
	}
	r := common.DB.Create(userRoleRel)
	if r.RowsAffected <= 0 || r.Error != nil {
		return false
	}
	return true
}
