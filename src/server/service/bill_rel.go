package service

import (
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/kit/functions"
	"github.com/jinzhu/gorm"
)

type BillRelService struct {
}

func (self *BillRelService) Create(billRelList ...*model.BillRel) (int, error) {
	var err error
	var r *gorm.DB
	var isTrue bool
	rows := 0
	tx := common.DB.Begin()
	for _, billRel := range billRelList {
		isTrue = tx.NewRecord(&billRel)
		if !isTrue {
			e := &functions.DefinedError{}
			e.Msg = "can not create a new record!"
			err = e
			tx.Rollback()
			return 0, err
		}
		r = tx.Create(&billRel)
		if r.Error != nil {
			tx.Rollback()
			return 0, r.Error
		}else {
			rows += int(r.RowsAffected)
		}
	}
	tx.Commit()
	return rows, nil
}
