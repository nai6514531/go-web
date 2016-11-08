package model

type billRel struct {
	Model
	BillId      string      `json:"billId"`
	Type        int         `json:"type"`
	IsSuccessed bool        `json:"isSuccessed"`
	Reason      string      `json:"reason"`
	OuterNo     string      `json:"outerNo"`
}

func (billRel) TableName() string {
	return "bill_rel"
}
