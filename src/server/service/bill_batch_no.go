package service

import (
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/kit/functions"
	"time"
)

type BillBatchNoService struct {
}

func (self *BillBatchNoService) Baisc(billIds ...interface{}) (*[]*model.BillBatchNo, error) {
	list := &[]*model.BillBatchNo{}
	r := common.DB.Where("bill_id in (?)", billIds...).Find(&list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *BillBatchNoService) BatchCreate(list *[]*model.BillBatchNo) (int, error) {
	var err error
	var rows int64
	rows = int64(0)
	tx := common.DB.Begin()
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
	isTrue := common.DB.NewRecord(billBatchNo)
	if !isTrue {
		e := &functions.DefinedError{}
		e.Msg = "can not create a new record!"
		err = e
		return 0, err
	}
	r := common.DB.Create(&billBatchNo)
	if r.Error != nil {
		return 0, r.Error
	}
	return int(r.RowsAffected), nil
}

func (self *BillBatchNoService) Delete(billIds ...interface{}) (int, error){
	r := common.DB.Model(&model.BillBatchNo{}).Where("bill_id in (?)", billIds...).Update("deleted_at", time.Now().Format("2006-01-02 15:04:05"))
	if r.Error != nil {
		return 0, r.Error
	}
	return int(r.RowsAffected), nil
}
