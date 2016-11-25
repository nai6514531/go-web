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

func ListByTimed(isCreated bool) (*[]*muniu.BoxAdmin, error) {
	list := &[]*muniu.BoxAdmin{}
	_time := time.Now().Add(-5 * time.Minute).Format("2006-01-02 15:04:05")
	_column := ""
	if isCreated {
		_column = "INSERTTIME"
	}else{
		_column = "UPDATETIME"
	}
	r := common.MNDB.Where(_column+" > ?", _time).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

//new but no use, no test
func (self *SyncService) SyncUserNew() (bool, error) {
	userService := &UserService{}
	syncService := &SyncService{}
	newUserIds := make([]int, 0)
	exitsUserMap := make(map[int]*model.User, 0)
	newAdminList, err := ListByTimed(true)       //查询旧数据库新增用户
	if err != nil {
		common.Logger.Warningln("Soda_Sync_Error:", err.Error())
		return false, err
	}
	for _, _admin := range *newAdminList {
		newUserIds = append(newUserIds, _admin.LocalId+1)       //新库用户id
	}
	exitsUserList, err := userService.ListById(newUserIds...)       //判断新数据库中是否存在
	if err != nil {
		common.Logger.Warningln("Soda_Sync_Error:", err.Error())
		return false, err
	}
	for _, _user := range *exitsUserList {
		exitsUserMap[_user.Id] = _user
	}

	for _, _admin := range *newAdminList {
		boo := true
		if exitsUserMap[_admin.LocalId+1] != nil {
			boo, _ = syncService.UpdateUser(_admin)
			if !boo {
				common.Logger.Warningln("Soda_Sync_Error:UpdateBoxAdmin:Id:", _admin.LocalId+1, ", error:", err.Error())
				return false, err
			}
			continue
		}
		boo, _ = syncService.AddUser(_admin)
		if !boo {
			common.Logger.Warningln("Soda_Sync_Error:SyAddBoxAdmin:Id:", _admin.LocalId+1, ", error:", err.Error())
			return false, err
		}
	}

	updateAdminList, err := ListByTimed(false)
	if err != nil {
		common.Logger.Warningln("Soda_Sync_Error:", err.Error())
		return false, err
	}
	for _, _admin := range *updateAdminList {
		boo := true
		boo, _ = syncService.UpdateUser(_admin)
		if !boo {
			common.Logger.Warningln("Soda_Sync_Error:UpdateBoxAdmin:Id:", _admin.LocalId+1, ", error:", err.Error())
			return false, err
		}
	}

	return true, nil
}

func (self *SyncService) SyncUserAndRel() (bool, error) {
	syncService := SyncService{}
	boo := true
	var err error
	list, err := syncService.ListBySyncBoxAdmin()
	if err != nil {
		common.Logger.Warningln("Soda_Sync_Error:ListBySyncBoxAdmin: ", err.Error())
		return false, err
	}
	boo, err = syncService.SyncUser(list)
	if !boo || err != nil {
		common.Logger.Warningln("Soda_Sync_Error:SyncUser: ", err.Error())
		return false, err
	}
	boo, err = syncService.SyncUserRole(list)
	if !boo || err != nil {
		common.Logger.Warningln("Soda_Sync_Error:SyncUserRole: ", err.Error())
		return false, err
	}
	boo, err = syncService.SyncUserCashAccount(list)
	if !boo || err != nil {
		common.Logger.Warningln("Soda_Sync_Error:SyncUserCashAccount: ", err.Error())
		return false, err
	}
	return true, nil
}

func (self *SyncService) ListBySyncBoxAdmin() (*[]*muniu.BoxAdmin, error) {
	list := &[]*muniu.BoxAdmin{}
	_time := time.Now().Add(-5 * time.Minute).Format("2006-01-02 15:04:05")
	r := common.MNDB.Where("INSERTTIME > ? or UPDATETIME > ?", _time, _time).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *SyncService) SyncUser(list *[]*muniu.BoxAdmin) (bool, error) {
	//list := &[]*muniu.BoxAdmin{}
	syncService := &SyncService{}
	userService := &UserService{}
	/*r := common.MNDB.Find(list)
	if r.Error != nil {
		return false, r.Error
	}*/
	boo := true
	for _, boxAdmin := range *list {
		userId := boxAdmin.LocalId + 1
		user, err := userService.Basic(userId)
		if user == nil && err != nil {
			boo, _ = syncService.AddUser(boxAdmin)
			if !boo {
				common.Logger.Warningln("Soda_Sync_Error:SyAddBoxAdmin:Id:", userId)
				break
			}
		} else {
			boo, _ = syncService.UpdateUser(boxAdmin)
			if !boo {
				common.Logger.Warningln("Soda_Sync_Error:UpdateBoxAdmin:Id:", userId)
				break
			}
		}
	}
	return boo, nil
}

func (self *SyncService) SyncUserRole(list *[]*muniu.BoxAdmin) (bool, error) {
	//list := &[]*muniu.BoxAdmin{}
	syncService := &SyncService{}
	userRoleRelService := &UserRoleRelService{}
	/*r := common.MNDB.Find(list)
	if r.Error != nil {
		common.Logger.Warningln("Soda_Sync_Error:common.MNDB.Find:BoxAdmin:List:", r.Error.Error())
		return false, r.Error
	}*/
	boo := true
	for _, boxAdmin := range *list {
		roleId := 0
		userId := (boxAdmin.LocalId + 1)
		userType, _ := strconv.Atoi(boxAdmin.UserType)
		if userType == 0 {
			roleId = 1 // 管理员
		} else if userType == 1 {
			roleId = 2 // 普通后台用户
		} else if userType == 2 {
			roleId = 2 // 普通后台用户
		} else if userType == 4 {
			roleId = 3 // 财务
		} else if userType == 5 {
			roleId = 4 // 客服
		} else {
			roleId = userType
		}
		if userId == 1 {
			roleId = 5
		}
		userRoleRel, err := userRoleRelService.BasicByUserId(userId)
		if userRoleRel == nil && err != nil {
			boo, _ = syncService.AddUserRoleRel(userId, roleId)
			if !boo {
				common.Logger.Warningln("Soda_Sync_Error:AddUserRoleRel:UserId:RoleId:", userId, roleId)
				break
			}
		} else {
			boo, _ = syncService.UpdateUserRoleRel(userId, roleId)
			if !boo {
				common.Logger.Warningln("Soda_Sync_Error:UpdateUserRoleRel:UserId:RoleId:", userId, roleId)
				break
			}
		}
	}
	return boo, nil
}

func (self *SyncService) SyncUserCashAccount(list *[]*muniu.BoxAdmin) (bool, error) {
	//list := &[]*muniu.BoxAdmin{}
	syncService := &SyncService{}
	userCashAccountService := &UserCashAccountService{}
	/*r := common.MNDB.Find(list)
	if r.Error != nil {
		common.Logger.Warningln("Soda_Sync_Error:common.MNDB.Find:BoxAdmin:List:", r.Error.Error())
		return false, r.Error
	}*/
	boo := true
	for _, boxAdmin := range *list {
		userId := (boxAdmin.LocalId + 1)
		userCashAccount, err := userCashAccountService.BasicByUserId(userId)
		if userCashAccount == nil && err != nil {
			boo, _ = syncService.AddUserCashAccount(boxAdmin)
			if !boo {
				common.Logger.Warningln("Soda_Sync_Error:AddUserCashAccount:UserId:", userId)
				break
			}
		} else {
			boo, _ = syncService.UpdateUserCashAccount(boxAdmin)
			if !boo {
				common.Logger.Warningln("Soda_Sync_Error:UpdateUserCashAccount:UserId:", userId)
				break
			}
		}
	}
	return boo, nil
}

func (self *SyncService) ListBySyncBoxInfo() (*[]*muniu.BoxInfo, error) {
	list := &[]*muniu.BoxInfo{}
	_time := time.Now().Add(-10 * time.Minute).Format("2006-01-02 15:04:05")
	r := common.MNDB.Where("INSERTTIME > ? or UPDATETIME > ?", _time, _time).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *SyncService) SyncDevice() (bool, error) {
	//list := &[]*muniu.BoxInfo{}
	//r := common.MNDB.Find(list)
	syncService := &SyncService{}
	deviceService := &DeviceService{}
	/*if r.Error != nil {
		common.Logger.Warningln("Soda_Sync_Error:common.MNDB.Find:BoxInfo:List:", r.Error.Error())
		return false, r.Error
	}*/
	list, err := syncService.ListBySyncBoxInfo()
	if err != nil {
		common.Logger.Warningln("Soda_Sync_Error:ListBySyncBoxInfo:", err.Error())
		return false, err
	}
	boo := true
	for _, boxInfo := range *list {
		device, err := deviceService.BasicBySerialNumber(boxInfo.DeviceNo)
		if device == nil && err != nil {
			boo, _ = syncService.AddDevice(boxInfo)
			if !boo {
				common.Logger.Warningln("Soda_Sync_Error:AddDevice:DeviceNo:", boxInfo.DeviceNo)
				break
			}
		} else {
			boo, _ = syncService.UpdateDevice(boxInfo)
			if !boo {
				common.Logger.Warningln("Soda_Sync_Error:UpdateDevice:DeviceNo:", boxInfo.DeviceNo)
				break
			}
		}
	}
	return boo, nil
}

func (self *SyncService) SyncDailyBill() (bool, error) {
	list := &[]*muniu.BoxStatBill{}
	r := common.MNDB.Where("status = 0 or status =1").Find(list)
	syncService := &SyncService{}
	dailyBillService := &DailyBillService{}
	if r.Error != nil {
		common.Logger.Warningln("Soda_Sync_Error:common.MNDB.Find:BoxStatBill:List:", r.Error.Error())
		return false, r.Error
	}
	boo := true
	for _, boxStatBill := range *list {
		userId := (boxStatBill.CompanyId + 1)
		dailyBill, err := dailyBillService.BasicByUserIdAndBillAt(userId, boxStatBill.PeriodStart)
		if dailyBill == nil && err != nil {
			boo, _ = syncService.AddDailyBill(boxStatBill)
			if !boo {
				common.Logger.Warningln("Soda_Sync_Error:AddDailyBill:UserId:BillAt:", userId, boxStatBill.PeriodStart)
				break
			}
		} else {
			boo, _ = syncService.UpdateDailyBill(boxStatBill)
			if !boo {
				common.Logger.Warningln("Soda_Sync_Error:UpdateDailyBill:UserId:BillAt:", userId, boxStatBill.PeriodStart)
				break
			}
		}
	}
	return boo, nil
}

func (self *SyncService) SyncDailyBillDetail() (bool, error) {
	list := &[]*muniu.BoxStatBill{}
	r := common.MNDB.Where("status = 0 or status =1").Find(list)
	syncService := &SyncService{}
	dailyBillDetailService := &DailyBillDetailService{}
	if r.Error != nil {
		common.Logger.Warningln("Soda_Sync_Error:common.MNDB.Find:BoxStatBill:List:", r.Error.Error())
		return false, r.Error
	}
	boo := true
	for _, boxStatBill := range *list {
		companyId := boxStatBill.CompanyId
		periodStart := boxStatBill.PeriodStart
		boxWashList := &[]*muniu.BoxWash{}
		userId := (companyId + 1)
		hasDeleted, err := dailyBillDetailService.DeleteByUserAndBillAt(userId, periodStart)
		if !hasDeleted || err != nil {
			common.Logger.Warningln("Soda_Sync_Error:DeleteByUserAndBillAt:UserId:periodStart:", userId, periodStart, err.Error())
			return false, err
		}
		_r := common.MNDB.Where("COMPANYID =? and date(INSERTTIME) = ?", companyId, periodStart).Find(boxWashList)
		if _r.Error != nil {
			common.Logger.Warningln("Soda_Sync_Error:Find(boxWashList):CompanyId:PeriodStart:", companyId, periodStart, _r.Error.Error())
			return false, _r.Error
		}
		for _, boxWash := range *boxWashList {
			boo, err = syncService.AddDailyBillDetail(boxWash)
			if !boo {
				common.Logger.Warningln("Soda_Sync_Error:AddDailyBillDetail:UserId:DeviceId:", (boxWash.UserId + 1), boxWash.DeviceId, err.Error())
				return false, err
			}
		}
	}
	return true, nil
}

func (self *SyncService) AddDailyBillDetail(boxWash *muniu.BoxWash) (bool, error) {
	//2016-03-14T00:00:10+08:00
	insertTime, _ := time.Parse(time.RFC3339, boxWash.InsertTime)
	billAt := insertTime.Format("2006-01-02 15:04:05")
	pulseType, _ := strconv.Atoi(boxWash.Type)
	dailyBillDetail := &model.DailyBillDetail{
		UserId:       (boxWash.UserId + 1),
		SerialNumber: boxWash.DeviceId,
		Amount:       int(boxWash.Price * 100),
		PulseType:    pulseType,
		BillAt:       billAt,
		Status:       boxWash.Status,
		WashId:       boxWash.LocalId,
	}
	r := common.DB.Create(dailyBillDetail)
	if r.Error != nil {
		return false, r.Error
	}
	return true, nil
}

func (self *SyncService) AddDailyBill(boxStatBill *muniu.BoxStatBill) (bool, error) {
	status, _ := strconv.Atoi(boxStatBill.Status)
	dailyBill := &model.DailyBill{
		UserId:      (boxStatBill.CompanyId + 1),
		UserName:    boxStatBill.MerchName,
		TotalAmount: int(boxStatBill.Money * 100),
		SettledAt:   boxStatBill.BillDate,
		BillAt:      boxStatBill.PeriodStart,
		OrderCount:  boxStatBill.Times,
		Status:      status,
	}
	r := common.DB.Create(dailyBill)
	if r.Error != nil {
		return false, r.Error
	}
	return true, nil
}

func (self *SyncService) UpdateDailyBill(boxStatBill *muniu.BoxStatBill) (bool, error) {
	status, _ := strconv.Atoi(boxStatBill.Status)
	userId := (boxStatBill.CompanyId + 1)
	billAt := boxStatBill.PeriodStart
	data := map[string]interface{}{
		"user_id":      userId,
		"user_name":    boxStatBill.MerchName,
		"total_amount": int(boxStatBill.Money * 100),
		"settled_at":   boxStatBill.BillDate,
		"bill_at":      billAt,
		"order_count":  boxStatBill.Times,
		"status":       status,
	}
	r := common.DB.Model(&model.DailyBill{}).Where("user_id = ? and bill_at = ?", userId, billAt).Updates(data)
	if r.Error != nil {
		return false, r.Error
	}
	return true, nil
}

func (self *SyncService) AddDevice(boxInfo *muniu.BoxInfo) (bool, error) {
	status, _ := strconv.Atoi(boxInfo.Status)
	deviceType, _ := strconv.Atoi(boxInfo.DeviceType)
	deviceType += 1
	device := &model.Device{
		UserId:            (boxInfo.CompanyId + 1),
		Password:          boxInfo.Password,
		Step:              boxInfo.Location,
		SerialNumber:      boxInfo.DeviceNo,
		ReferenceDeviceId: deviceType,
		Address:           boxInfo.Address,
		FirstPulsePrice:   int(boxInfo.Price_601 * 100),
		SecondPulsePrice:  int(boxInfo.Price_602 * 100),
		ThirdPulsePrice:   int(boxInfo.Price_603 * 100),
		FourthPulsePrice:  int(boxInfo.Price_604 * 100),
		FirstPulseName:    "单脱",
		SecondPulseName:   "快洗",
		ThirdPulseName:    "标准洗",
		FourthPulseName:   "大物洗",
		Status:            status,
	}
	r := common.DB.Create(device)
	if r.Error != nil {
		return false, r.Error
	}
	return true, nil
}

func (self *SyncService) UpdateDevice(boxInfo *muniu.BoxInfo) (bool, error) {
	status, _ := strconv.Atoi(boxInfo.Status)
	deviceType, _ := strconv.Atoi(boxInfo.DeviceType)
	deviceType += 1
	data := map[string]interface{}{
		"user_id":             (boxInfo.CompanyId + 1),
		"password":            boxInfo.Password,
		"step":                boxInfo.Location,
		"serial_number":       boxInfo.DeviceNo,
		"reference_device_id": deviceType,
		"address":             boxInfo.Address,
		"first_pulse_price":   int(boxInfo.Price_601 * 100),
		"second_pulse_price":  int(boxInfo.Price_602 * 100),
		"third_pulse_price":   int(boxInfo.Price_603 * 100),
		"fourth_pulse_price":  int(boxInfo.Price_604 * 100),
		"first_pulse_name":    "单脱",
		"second_pulse_name":   "快洗",
		"third_pulse_name":    "标准洗",
		"fourth_pulse_name":   "大物洗",
		"status":              status,
	}
	r := common.DB.Model(&model.Device{}).Where("serial_number = ?", boxInfo.DeviceNo).Updates(data)
	if r.Error != nil {
		return false, r.Error
	}
	return true, nil
}

func (self *SyncService) AddUser(boxAdmin *muniu.BoxAdmin) (bool, error) {
	_parentId, _ := strconv.Atoi(boxAdmin.AgencyId)
	_parentId += 1
	user := &model.User{
		Name:      boxAdmin.Name,
		Contact:   boxAdmin.Contact,
		Address:   boxAdmin.Address,
		Account:   boxAdmin.Mobile,
		Password:  boxAdmin.Password,
		Telephone: boxAdmin.ServicePhone,
		Mobile:    boxAdmin.ServicePhone,
		ParentId:  _parentId,
	}
	user.Id = (boxAdmin.LocalId + 1)
	r := common.DB.Create(user)
	if r.Error != nil {
		return false, r.Error
	}
	return true, nil
}

func (self *SyncService) UpdateUser(boxAdmin *muniu.BoxAdmin) (bool, error) {
	_parentId, _ := strconv.Atoi(boxAdmin.AgencyId)
	_parentId += 1
	data := map[string]interface{}{
		"name":      boxAdmin.Name,
		"contact":   boxAdmin.Contact,
		"address":   boxAdmin.Address,
		"account":   boxAdmin.Mobile,
		"password":  boxAdmin.Password,
		"telephone": boxAdmin.ServicePhone,
		"mobile":    boxAdmin.ServicePhone,
		"parent_id": _parentId,
	}
	userId := (boxAdmin.LocalId + 1)
	r := common.DB.Model(&model.User{}).Where("id = ?", userId).Updates(data)
	if r.Error != nil {
		return false, r.Error
	}
	return true, nil
}

func (self *SyncService) AddUserCashAccount(boxAdmin *muniu.BoxAdmin) (bool, error) {
	payType, _ := strconv.Atoi(boxAdmin.PayType)
	payType += 1
	userId := (boxAdmin.LocalId + 1)
	userCashAccount := &model.UserCashAccount{
		UserId:   userId,
		Type:     payType,
		BankName: boxAdmin.BankName,
		Account:  boxAdmin.PayAccount,
		RealName: boxAdmin.PayName,
		Mobile:   boxAdmin.ServicePhone,
	}
	r := common.DB.Create(userCashAccount)
	if r.Error != nil {
		return false, r.Error
	}
	return true, nil
}

func (self *SyncService) UpdateUserCashAccount(boxAdmin *muniu.BoxAdmin) (bool, error) {
	payType, _ := strconv.Atoi(boxAdmin.PayType)
	payType += 1
	userId := (boxAdmin.LocalId + 1)
	data := map[string]interface{}{
		"type":      payType,
		"bank_name": boxAdmin.BankName,
		"account":   boxAdmin.PayAccount,
		"real_name": boxAdmin.PayName,
		"mobile":    boxAdmin.ServicePhone,
	}
	r := common.DB.Model(&model.UserCashAccount{}).Where("user_id = ?", userId).Updates(data)
	if r.Error != nil {
		return false, r.Error
	}
	return true, nil
}
func (self *SyncService) AddUserRoleRel(userId int, roleId int) (bool, error) {
	userRoleRel := &model.UserRoleRel{
		UserId: userId,
		RoleId: roleId,
	}
	r := common.DB.Create(userRoleRel)
	if r.Error != nil {
		return false, r.Error
	}
	return true, nil
}

func (self *SyncService) UpdateUserRoleRel(userId int, roleId int) (bool, error) {
	data := map[string]interface{}{
		"user_id": userId,
		"role_id": roleId,
	}
	r := common.DB.Model(&model.UserRoleRel{}).Where("user_id = ?", userId).Updates(data)
	if r.Error != nil {
		return false, r.Error
	}
	return true, nil
}
