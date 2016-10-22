package muniu

import (
	"maizuo.com/soda-manager/src/server/model"
	"strconv"
)

type BoxAdmin struct {
	LocalId        int     `json:"local_id" gorm:"column:LOCALID"`
	Name           string  `json:"name" gorm:"column:NAME"`
	Contact        string  `json:"contact" gorm:"column:CONTCAT"`
	Address        string  `json:"address" gorm:"column:ADDRESS"`
	Mobile         string  `json:"mobile" gorm:"column:MOBILE"`
	Password       string  `json:"password" gorm:"column:PASSWORD"`
	UserType       string  `json:"user_type" gorm:"column:USERTYPE"`
	Status         string  `json:"status" gorm:"column:STATUS"`
	InsertTime     string  `json:"insert_time" gorm:"column:INSERTTIME"`
	UpdateTime     string  `json:"update_time" gorm:"column:UPDATETIME"`
	AgencyId       string  `json:"agency_id" gorm:"column:AGENCYID"`
	PayType        string  `json:"pay_type" gorm:"column:PAYTYPE"`
	PayName        string  `json:"pay_name" gorm:"column:PAYNAME"`
	PayAccount     string  `json:"pay_account" gorm:"column:PAYACCOUNT"`
	ServicePhone   string  `json:"service_phone" gorm:"column:SERVICEPHONE"`
	BankName       string  `json:"bank_name" gorm:"column:BANKNAME"`
	ContactNum     string  `json:"contact_num" gorm:"column:CONTACTNUM"`
	FOrgId         int     `json:"f_org_id" gorm:"column:f_org_id"`
	FGlobalId      int     `json:"f_global_id" gorm:"column:f_global_id"`
	FSalt          string  `json:"f_salt" gorm:"column:f_salt"`
	FRank          int     `json:"f_rank" gorm:"column:f_rank"`
	ErrorCount     int     `json:"error_count" gorm:"column:error_count"`
	LoginIp        string  `json:"login_ip" gorm:"column:login_ip"`
	LastLoginTime  string  `json:"last_login_time" gorm:"column:last_login_time"`
	Recharge       float64 `json:"recharge" gorm:"column:recharge"`
	SecondPassword string  `json:"second_password" gorm:"column:second_password"`
	NewPassword    string  `json:"new_password" gorm:"column:newpassword"`
}

func (BoxAdmin) TableName() string {
	return "box_admin"
}

//用User填充
func (self *BoxAdmin) FillByUser(user *model.User) {
	self.LocalId = user.Id - 1 //木牛有id为0的记录映射到新数据是1
	self.Name = user.Name
	self.Contact = user.Contact
	self.Address = user.Address
	self.Mobile = user.Account
	self.ServicePhone = user.Telephone
	self.AgencyId = strconv.Itoa(user.ParentId - 1) //木牛有id为0的记录映射到新数据是1
	self.Status = strconv.Itoa(user.Status)
	self.Password = user.Password
	self.InsertTime = user.CreatedAt.Format("2006-01-02 15:04:05")
	self.UpdateTime = user.UpdatedAt.Format("2006-01-02 15:04:05")
}

//用UserRoleRel填充
func (self *BoxAdmin) FillByUserRoleRel(userRoleRel *model.UserRoleRel) {
	self.LocalId = userRoleRel.UserId - 1 //木牛有id为0的记录映射到新数据是1
	switch userRoleRel.RoleId {
	case 1: //系统管理员
		self.UserType = "0"
	case 2: //普通后台用户
		self.UserType = "2"
	case 4: //客服
		self.UserType = "5"
	default:
		self.UserType = strconv.Itoa(userRoleRel.RoleId)
	}
}

//用userCashAccount填充
func (self *BoxAdmin) FillByUserCashAccount(userCashAccount *model.UserCashAccount) {
	self.LocalId = userCashAccount.UserId - 1 //木牛有id为0的记录映射到新数据是1
	self.PayType = strconv.Itoa(userCashAccount.Type - 1)
	self.BankName = userCashAccount.BankName
	self.PayAccount = userCashAccount.Account
	self.PayName = userCashAccount.RealName
	self.ContactNum = userCashAccount.Mobile
}
