package model

/**
  用户信息
*/
type User struct {
	Model
	Name      string `json:"name"`      //名称
	Contact   string `json:"contact"`   //联系人
	Address   string `json:"address"`   //联系地址
	Mobile    string `json:"mobile"`    //手机
	Account   string `json:"account"`   //账号
	Password  string `json:"password"`  //密码
	Telephone string `json:"telephone"` //服务电话
	Email     string `json:"email"`     //邮箱
	ParentId  uint32 `json:"parent_id"` //父id
	Gender    uint16 `json:"gender"`    //性别
	Age       uint16 `json:"age"`       //年龄
	Status    uint16 `json:"status"`    //状态
}

func (User) TableName() string {
	return "user"
}
