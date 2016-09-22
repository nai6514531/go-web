package service

import (
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/common"
)

type ScheduleService struct {
}

func (self *ScheduleService) BasicMap(ids []int) (map[int]interface{}, error) {
	list := &[]*model.Schedule{}
	scheduleMap := make(map[int]interface{})

	r := common.DB.Where(" id IN (?)", ids).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}

	for _, schedule := range *list {
		scheduleMap[schedule.Id] = schedule
	}
	return scheduleMap, r.Error
}
