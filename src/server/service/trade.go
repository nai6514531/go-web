package service

import (
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/util"
	"time"
	"strconv"
	"fmt"
	"math/rand"
	"github.com/spf13/viper"
	"encoding/json"
)

type TradeService struct {
}

/**
	生成订单号
 */
func (self *TradeService) CreateNo() (string, error) {

	rnd := rand.New(rand.NewSource(time.Now().UnixNano()))
	randNumber := fmt.Sprintf("%06v", rnd.Int31n(1000000))

	_base_date := "2016-09-01"
	timeFormat := "2006-01-02"

	_today := time.Unix(time.Now().Unix(), 0).Format(timeFormat)

	base_date, err := time.Parse(timeFormat, _base_date)
	if err != nil {
		common.Logger.Warningln("创建订单时,解析订单基准日期出错!")
		return "", err
	}

	today, err := time.Parse(timeFormat, _today)
	if err != nil {
		common.Logger.Warningln("创建订单时,解析订单当前日期出错!")
		return "", err
	}

	daysHasPassed := strconv.Itoa(int(time.Now().Sub(base_date).Hours() / 24))
	secondsHasPassed := strconv.Itoa(int(time.Now().Sub(today).Seconds()))

	return daysHasPassed + randNumber + secondsHasPassed, nil
}

func (self *TradeService) CreateTemporaryRecord(data map[string]interface{}, no string) (bool, error) {
	prefix := viper.GetString("server.redis.prefix") + ":"
	_data, err := json.Marshal(data)
	if err != nil {
		fmt.Println(err.Error())
		common.Logger.Warningln("创建临时订单时,解析订单数据出错!")
		return false, err
	}
	_, err = common.Redis.Set(prefix + no, _data, time.Minute * 15).Result()
	if err != nil {
		common.Logger.Warningln("创建临时订单出错!")
		return false, err
	}
	return true, nil
}

func (self *TradeService)TemporaryRecordDetail(no string) (string, error) {
	prefix := viper.GetString("server.redis.prefix") + ":"
	result, err := common.Redis.Get(prefix + no).Result()
	if err != nil {
		common.Logger.Warningln("读取临时订单出错!")
		return "", err
	}
	return result, nil
}

/**
	生成订单记录
 */
func (self *TradeService) Create(trade *model.Trade) error {
	var err error
	isTrue := common.DB.NewRecord(trade)
	if !isTrue {
		e := &util.DefinedError{}
		e.Msg = "can not create a new record!"
		err = e
		return err
	}

	r := common.DB.Create(&trade)
	if r.Error != nil {
		return r.Error
	}
	return nil
}

func (self *TradeService) BasicByHall(hallId int, scheduleId int, at string, start int, limit int) (*[]*model.Trade, error) {
	list := &[]*model.Trade{}
	r := common.DB.Where(" hall_id = ? AND schedule_id = ? AND created_at between ? AND ? ", hallId, scheduleId, at +" 00:00:00", at +" 23:59:59").Offset(start).Limit(limit).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, r.Error
}

func (self *TradeService) TotalByHallId(hallId int, scheduleId int, at string) (int, error) {
	var count int
	r := common.DB.Model(&model.Trade{}).Where(" hall_id = ? AND schedule_id = ? AND created_at between ? AND ? ", hallId, scheduleId, at +" 00:00:00", at +" 23:59:59").Count(&count)
	if r.Error != nil {
		return 0, r.Error
	}
	return count, r.Error
}

func (self *TradeService) BasicByCinemaIdAndAt(cinemaId int, at string) (*[]*model.Trade, error) {
	list := &[]*model.Trade{}
	r := common.DB.Where(" cinema_id = ? AND created_at between ? AND ? ", cinemaId, at +" 00:00:00", at +" 23:59:59").Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, r.Error
}

/**
	根据影院id+日期+状态条件查询订单数量接口
 */
func (self *TradeService) CountMapByCinemaId(cinemaId int, at string, status int) (map[int]int, error) {
	countMap := make(map[int]int)
	var count int
	var hallId int
	rows, err := common.DB.Table("trade").Select(" count(*) as count, hall_id ").Where(" cinema_id = ? AND created_at between ? AND ? ", cinemaId, at +" 00:00:00", at +" 23:59:59").Group("hall_id").Rows()
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		rows.Scan(&count, &hallId)
		countMap[hallId] = count
	}
	return countMap, nil
}

func (self *TradeService) BasicByTradeNo(tradeNo string) (*model.Trade, error) {
	trade := &model.Trade{}
	r := common.DB.Where(" trade_no = ? ", tradeNo).First(trade)
	if r.Error != nil {
		return nil, r.Error
	}
	return trade, r.Error
}

func (self *TradeService) BasicListByTradeNo(tradeNos []string) (*[]*model.Trade, error) {
	list := &[]*model.Trade{}
	r := common.DB.Where(" trade_no in (?) ", tradeNos).Order("schedule_id").Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, r.Error
}

func (self *TradeService) DetailByTradeNo(tradeNo string) (*model.Trade, error) {
	tradeService := &TradeService{}
	tradeGoodsRelService := &TradeGoodsRelService{}
	cinemaService := &CinemaService{}
	hallService := &HallService{}
	deviceService := &DeviceService{}
	cinemaMap := make(map[string]interface{})
	hallMap := make(map[string]interface{})
	deviceMap := make(map[string]interface{})

	trade, err := tradeService.BasicByTradeNo(tradeNo)
	if err != nil {
		return nil, err
	}

	tradeNos := []string{tradeNo}
	if len(tradeNos) != 0 {
		tgrMap, _ := tradeGoodsRelService.BasicMap(tradeNos)
		trade.TradeGoodsRel = tgrMap
	}

	cinema, _ := cinemaService.Basic(trade.CinemaId)
	if cinema != nil {
		cinemaMap["name"] = cinema.Name
		trade.Cinema = cinemaMap
	}

	hall, _ := hallService.Basic(trade.HallId)
	if hall != nil {
		hallMap["name"] = hall.Name
		trade.Hall = hallMap
	}

	device, _ := deviceService.Basic(trade.DeviceId)
	if device != nil {
		deviceMap["row_name"] = device.RowName
		deviceMap["column_name"] = device.ColumnName
		deviceMap["status"] = device.Status
		trade.Device = deviceMap
	}

	return trade, nil
}


func (self *TradeService) DetailByTradeNos(tradeNos []string) (*[]*model.Trade, error) {
	tradeService := &TradeService{}
	tradeGoodsRelService := &TradeGoodsRelService{}
	cinemaService := &CinemaService{}
	hallService := &HallService{}
	deviceService := &DeviceService{}
	scheduleService := &ScheduleService{}
	tgrMap := make(map[string]interface{})
	cinemaMap := make(map[int]interface{})
	hallMap := make(map[int]interface{})
	deviceMap := make(map[int]interface{})
	scheduleMap := make(map[int]interface{})
	cinemaIds := []int{}
	hallIds := []int{}
	deviceIds := []int{}
	scheduleIds := []int{}

	tradeList, err := tradeService.BasicListByTradeNo(tradeNos)
	if err != nil {
		return nil, err
	}

	for _, trade := range *tradeList {
		cinemaIds = append(cinemaIds, trade.CinemaId)
		hallIds = append(hallIds, trade.HallId)
		deviceIds = append(deviceIds, trade.DeviceId)
		scheduleIds = append(scheduleIds, trade.ScheduleId)
	}

	if len(tradeNos) != 0 {
		tgrMap, _ = tradeGoodsRelService.BasicMap(tradeNos)
	}
	if len(cinemaIds) != 0 {
		cinemaMap, _ = cinemaService.BasicMap(cinemaIds)
	}
	if len(hallIds) != 0 {
		hallMap, _ = hallService.BasicMap(hallIds)
	}
	if len(deviceIds) != 0 {
		deviceMap, _ = deviceService.BasicMap(deviceIds)
	}
	if len(scheduleIds) != 0 {
		scheduleMap, _ = scheduleService.BasicMap(scheduleIds)
	}

	for _, trade := range *tradeList {
		_cinemaMap := make(map[string]interface{})
		_hallMap := make(map[string]interface{})
		_deviceMap := make(map[string]interface{})
		_scheduleMap := make(map[string]interface{})

		trade.TradeGoodsRel = tgrMap[trade.TradeNo]

		if cinemaMap[trade.CinemaId] != nil {
			_cinemaMap["name"] = cinemaMap[trade.CinemaId].(*model.Cinema).Name

			trade.Cinema = _cinemaMap
		}

		if hallMap[trade.HallId] != nil {
			_hallMap["name"] = hallMap[trade.HallId].(*model.Hall).Name
			trade.Hall = _hallMap
		}

		if scheduleMap[trade.ScheduleId] != nil {
			schedule := scheduleMap[trade.ScheduleId].(*model.Schedule)
			_scheduleMap["name"] = schedule.Name
			_scheduleMap["show_at"] = schedule.ShowAt
			trade.Schedule = _scheduleMap
		}

		if deviceMap[trade.DeviceId] != nil {
			_device := deviceMap[trade.DeviceId].(*model.Device)
			_deviceMap["row_name"] = _device.RowName
			_deviceMap["column_name"] = _device.ColumnName
			_deviceMap["status"] = _device.Status
		}
		trade.Device = _deviceMap

	}

	return tradeList, nil
}

func (self *TradeService) Update(tradeNos []string, status int) (int64, error) {
	r := common.DB.Model(&model.Trade{}).Update("status", status)
	if r.Error != nil {
		return r.RowsAffected, r.Error
	}
	return r.RowsAffected, nil
}
