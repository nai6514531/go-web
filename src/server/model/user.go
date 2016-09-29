package model

/**
  用户信息
*/
type User struct {
	Model
	Name      string `json:"name"`
	Contact   string `json:"contact"`
	Address   string `json:"address"`
	Mobile    string `json:"mobile"`
	Account   string `json:"account"`   //账号
	Password  string `json:"password"`  //密码
	Telephone string `json:"telephone"` //服务电话
	Email     string `json:"email"`     //邮箱
	ParentId  int    `json:"parent_id"`
	Gender    int    `json:"gender"`
	Age       int    `json:"age"`
	Status    int    `json:"status"`
}

func (User) TableName() string {
	return "user"
}
