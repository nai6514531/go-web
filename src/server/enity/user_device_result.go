package enity

import (
	"maizuo.com/soda-manager/src/server/model"
)

type UserDeviceResult struct {
	User   model.User  `json:"user"`
	Device interface{} `json:"device"`
}
