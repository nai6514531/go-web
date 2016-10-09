package model

type PermissionMenuRel struct {
	Model
	PermissionId int `json:"permission_id"`
	MenuId       int `json:"menu_id"`
	Status       int `json:"status"`
}

func (PermissionMenuRel) TableName() string {
	return "permission_menu_rel"
}
