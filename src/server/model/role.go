package model

type Role struct {
	Model
	Name        string `json:"name"`
	Description string `json:"description"`
	status      int    `json:"status"`
}

func (Role) TableName() string {
	return "role"
}
