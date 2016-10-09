package model

type Permission struct {
	Model
	Name   string `json:"name"`
	Type   int    `json:"type"`
	Status int    `json:"status"`
}

func (Permission) TableName() string {
	return "permission"
}
