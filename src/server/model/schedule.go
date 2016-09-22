package model

import "time"

type Schedule struct {
	Model
	Name   string    `json:"name"`
	ShowAt time.Time `json:"show_at"`
}

func (Schedule) TableName() string {
	return "schedule"
}
