package enity

import (
	"maizuo.com/soda-manager/src/server/model"
)

type SchoolDeviceResult struct {
	School model.School `json:"school"`
	Device interface{}  `json:"device"`
}
