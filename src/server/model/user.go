package model

import "github.com/bitly/go-simplejson"

/**
  用户信息
*/
type User struct {
	Model
	Name        string      `json:"name"`      //名称
	Contact     string      `json:"contact"`   //联系人
	Address     string      `json:"address"`   //联系地址
	Mobile      string      `json:"mobile"`    //手机
	Account     string      `json:"account"`   //账号
	Password    string      `json:"password"`  //密码
	Telephone   string      `json:"telephone"` //服务电话
	Email       string      `json:"email"`     //邮箱
	ParentId    int         `json:"parentId"`  //父id
	Gender      int         `json:"gender"`    //性别
	Age         int         `json:"age"`       //年龄
	Status      int         `json:"status"`    //状态
	Role        interface{} `json:"role,omitempty" gorm:"-"`
	Menu        interface{} `json:"menu,omitempty" gorm:"-"`
	DeviceTotal int         `json:"deviceTotal,omitempty" gorm:"-"`
	CashAccount interface{} `json:"cashAccount,omitempty" gorm:"-"`
	Key         string      `json:"key,omitempty" gorm:"-"`
	Extra       string      `json:"extra,omitempty"`
	Nickname    string 	`json:"nickname" gorm:"-"`
	HeadImgUrl  string 	`json:"headImgUrl" gorm:"-"`
}

func (User) TableName() string {
	return "user"
}

func (user *User) Mapping() *User{
	if user.Extra == "" {
		return user
	}else{
		extra,_ := simplejson.NewJson([]byte(user.Extra))
		user.Nickname = extra.Get("nickName").MustString()
		user.HeadImgUrl = extra.Get("headimgurl").MustString()
		user.Extra = ""
		return user
	}
}
