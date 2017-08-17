package service

import (
	"github.com/jinzhu/gorm"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/kit/functions"
	"maizuo.com/soda-manager/src/server/model"
)

type BillRelService struct {
}

func (self *BillRelService) Baisc(billIds ...interface{}) (*[]*model.BillRel, error) {
  list := &[]*model.BillRel{}
  r := common.SodaMngDB_R.Where("bill_id in (?)", billIds...).Find(&list)
  if r.Error != nil {
    return nil, r.Error
  }
  return list, nil
}

func (self *BillRelService) Create(billRelList ...*model.BillRel) (int, error) {
	var err error
	var r *gorm.DB
	var isTrue bool
	rows := 0
	tx := common.SodaMngDB_WR.Begin()
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
		} else {
			rows += int(r.RowsAffected)
		}
	}
	tx.Commit()
	return rows, nil
}

func (self *BillRelService) Delete(billIds ...interface{}) (int, error) {
	r := common.SodaMngDB_WR.Where("bill_id in (?)", billIds...).Delete(&model.BillRel{})
	if r.Error != nil {
		return 0, r.Error
	}
	return int(r.RowsAffected), nil
}
