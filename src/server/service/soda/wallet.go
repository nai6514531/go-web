package sodaService

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model/soda"
)

type WalletService struct {
}

func (self *WalletService) BasicByMobile(mobile string) (*soda.Wallet, error) {
	wallet := &soda.Wallet{}
	r := common.SodaDB_R.Where("mobile = ? ", mobile).First(wallet)
	if r.Error != nil {
		return nil, r.Error
	}
	return wallet, nil
}
