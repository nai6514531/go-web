package service

import (
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/common"
)

type ChannelService struct {

}

func (self *ChannelService)Basic(id int) (*model.Channel, error) {
	channel := &model.Channel{}
	r := common.DB.Where("id = ?", id).First(channel)
	if r.Error != nil {
		return nil, r.Error
	}
	return channel, r.Error
}

func (self *ChannelService)BasicByIdentify(identify string) (*model.Channel, error) {
	channel := &model.Channel{}
	r := common.DB.Where("identify = ?", identify).First(channel)
	if r.Error != nil {
		return nil, r.Error
	}
	return channel, r.Error
}


