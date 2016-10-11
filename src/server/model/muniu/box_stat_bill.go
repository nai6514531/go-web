package muniu

type BoxStatBill struct {
	LocalId     int     `json:"local_id" gorm:"column:LOCALID"`
	AgencyId    string  `json:"agency_id" gorm:"column:AGENCYID"`
	CompanyId   int     `json:"company_id" gorm:"column:COMPANYID"`
	AgencyName  string  `json:"agency_name" gorm:"column:AGENCYNAME"`
	MerchName   string  `json:"merch_name" gorm:"column:MERCHNAME"`
	PeriodStart string  `json:"period_start" gorm:"column:PERIOD_START"`
	PeriodEnd   string  `json:"period_end" gorm:"column:PERIOD_END"`
	BillDate    string  `json:"bill_date" gorm:"column:BILLDATE"`
	Money       float64 `json:"money" gorm:"column:MONEY"`
	Times       int     `json:"times" gorm:"column:TIMES"`
	Status      string  `json:"status" gorm:"column:STATUS"`
	InsertTime  string  `json:"insert_time" gorm:"column:INSERTTIME"`
}

func (BoxStatBill) TableName() string {
	return "box_stat_bill"
}
