package model

/**
  用户信息
*/
type Channel struct {
	Model

	Status      int    `json:"status"`        //状态 0:关注 1:未关注
}

func (Channel) TableName() string {
	return "channel"
}
