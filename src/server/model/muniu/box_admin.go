package muniu

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
