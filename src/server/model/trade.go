package model

import "time"

/**
  订单信息
*/
type Trade struct {
	Model
	TradeNo       string    `json:"trade_no"`       //订单号
	OuterTradeNo  string    `json:"outer_trade_no"` //交易号
	ProvinceId    int       `json:"province_id"`    //省份id
	CityId        int       `json:"city_id"`        //城市id
	DistrictId    int       `json:"district_id"`    //区域id
	CinemaId      int       `json:"cinema_id"`      //影院id
	ScheduleId    int       `json:"schedule_id"`    //排期id
	UserId        int       `json:"user_id"`        //用户id
	HallId        int       `json:"hall_id"`        //影厅id
	DeviceId      int       `json:"device_id"`      //设备id
	TotalPrice    int       `json:"total_price"`    //总金额
	Cash          int       `json:"cash"`           //实际支付金额
	Status        int       `json:"status"`         //状态 0:未支付 1:已支付+未发货 2已支付+已发货 3:已支付+发货失败 4已支付+发货失败+退款成功 5:已支付+发货失败+退款成功 6:支付失败
	PaidAt        time.Time `json:"paid_at"`        //支付时间
	RefundedAt    time.Time `json:"refunded_at"`    //退票时间
	TradeGoodsRel interface{} `json:"tradeGoodsRel,omitempty" gorm:"-"`
	Cinema        interface{} `json:"cinema,omitempty" gorm:"-"`
	Schedule      interface{} `json:"schedule,omitempty" gorm:"-"`
	Hall          interface{} `json:"hall,omitempty" gorm:"-"`
	Device        interface{} `json:"device,omitempty" gorm:"-"`
	Goods         interface{} `json:"goods,omitempty" gorm:"-"`
}

func (Trade) TableName() string {
	return "trade"
}
