package service

import (
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/kit/functions"
)

type BillBatchNoService struct {
}

func (self *BillBatchNoService) Baisc(billIds ...interface{}) (*[]*model.BillBatchNo, error) {
	list := &[]*model.BillBatchNo{}
	r := common.SodaMngDB_R.Where("bill_id in (?)", billIds...).Find(&list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *BillBatchNoService) BatchCreate(list *[]*model.BillBatchNo) (int, error) {
	var err error
	var rows int64
	rows = int64(0)
	tx := common.SodaMngDB_WR.Begin()
	for _, _billBatchNo := range *list {
		isTure := tx.NewRecord(_billBatchNo)
		if !isTure {
			e := &functions.DefinedError{}
			e.Msg = "can not create a new record!"
			err = e
			tx.Rollback()
			return 0, err
		}
		r := tx.Create(&_billBatchNo)
		if r.Error != nil {
			tx.Rollback()
			return 0, r.Error
		}
		rows += r.RowsAffected
	}
	tx.Commit()
	return int(rows), nil
}

func (self *BillBatchNoService) Create(billBatchNo *model.BillBatchNo) (int, error) {
	var err error
	isTrue := common.SodaMngDB_WR.NewRecord(billBatchNo)
	if !isTrue {
		e := &functions.DefinedError{}
		e.Msg = "can not create a new record!"
		err = e
		return 0, err
	}
	r := common.SodaMngDB_WR.Create(&billBatchNo)
	if r.Error != nil {
		return 0, r.Error
	}
	return int(r.RowsAffected), nil
}

func (self *BillBatchNoService) Delete(billIds ...interface{}) (int, error){
	r := common.SodaMngDB_R.Where("bill_id in (?)", billIds...).Delete(&model.BillBatchNo{})
	if r.Error != nil {
		return 0, r.Error
	}
	return int(r.RowsAffected), nil
}
