package model

/**
  用户信息
*/
type User struct {
	Model
	Account        string `json:"account"`          //账号
	Agent          string `json:"angent"`           //代理商
	Password       string `json:"password"`         //密码
	Telphone       string `json:"telphone"`         //服务电话
	Mobile         string `json:"mobile"`           //手机
	Email          string `json:"email"`            //邮箱
	AlipayAccount  string `json:"alipay_account"`   //支付宝账号
	AlipayRealName string `json:"alipay_real_name"` //支付宝姓名
}

func (User) TableName() string {
	return "user"
}
