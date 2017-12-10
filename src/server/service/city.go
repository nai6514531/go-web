package service

import (
	"strings"

	simplejson "github.com/bitly/go-simplejson"
	"github.com/go-errors/errors"
	"github.com/levigross/grequests"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
)

type CityService struct {
}

func (self *CityService) GetByID(id int) (*model.City, error) {
	city := model.City{}
	err := common.SodaMngDB_R.Where("id = ?", id).First(&city).Error
	if err != nil {
		return nil, err
	}
	return &city, nil
}

func (self *CityService) GetByName(name string) (*model.City, error) {
	city := model.City{}
	err := common.SodaMngDB_R.Where("name like ?", "%"+name+"%").First(&city).Error
	if err != nil {
		return nil, err
	}
	return &city, nil
}

func (self *CityService) GetByIP(ip string) (*model.City, error) {
	url := viper.GetString("resource.lbs.tencent.host") + "/ws/location/v1/ip"
	key := viper.GetString("resource.lbs.tencent.key")
	if ip == "" {
		return nil, errors.New("ip is nil")
	}
	res, err := grequests.Get(url, &grequests.RequestOptions{
		Params: map[string]string{"ip": ip, "key": key},
	})
	if err != nil {
		return nil, err
	}
	_location, err := simplejson.NewJson(res.Bytes())
	if err != nil {
		return nil, err
	}
	result := _location.Get("result")
	name := result.GetPath("ad_info", "city")
	_name := ""
	if name.MustString() == "" {
		_name = "深圳"
	} else {
		_name = strings.Split(name.MustString(), "市")[0]
	}
	// cut "市" for db query
	city, err := self.GetByName(_name)
	if err != nil {
		return nil, err
	}
	return city, nil
}
