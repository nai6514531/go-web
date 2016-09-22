package model

/**
  用户信息
*/
type User struct {
	Model
	ThirdUserId string `json:"third_user_id"`                   //第三方用户Id
	ChannelId   int        `json:"channel_id"`                  //渠道Id
	Channel     interface{} `gorm:"-";json:"channel,omitempty"` //渠道详情
	NickName    string `json:"nick_name"`                       //昵称
	Account     string `json:"account"`                         //账号
	Gravatar    string `json:"gravatar"`                        //头像
	Password    string `json:"password"`                        //密码
	Email       string `json:"email"`                           //邮箱
	Mobile      string `json:"mobile"`                          //手机号
	Gender      int    `json:"gender"`                          //性别 0:男 1:女
	Status      int    `json:"status"`                          //状态 0:关注 1:未关注
}

func (User) TableName() string {
	return "user"
}
