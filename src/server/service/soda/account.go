package sodaService

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model/soda"
)

type AccountService struct {
}

func (self *AccountService) FindByMobile(mobile string) (*soda.Account, error) {
	account := &soda.Account{}
	r := common.SodaDB_R.Where("app = 0 and mobile = ?", mobile).First(account)
	if r.Error != nil {
		return account, r.Error
	}
	return account, nil
}

func (self *AccountService) UpdatePasswordByMobile(mobile string, password string) (bool, error) {
	sql := `
	update account
	set password=?
	where
	app = 0
	and
	mobile = ?
	`
	r := common.SodaDB_WR.Exec(sql, password, mobile)
	if r.Error != nil {
		return false, r.Error
	}
	return true, nil
}
