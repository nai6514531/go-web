package sodaService

import (
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model/soda"
	"github.com/bitly/go-simplejson"
)

type AccountService struct {
}

func (self *AccountService) FindByMobile(mobile string) (*soda.Account, error) {
	account := &soda.Account{}
	r := common.SodaDB_R.Where("app = 0 and mobile = ?", mobile).First(account)
	if r.Error != nil {
		return nil, r.Error
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
func (self *AccountService) GetOpenIdOfExtra(userId int) string {
	account, err := self.GetByUserIdAndApp(userId, 1)
	if err != nil {
		common.Logger.Debugln("get account err:", err.Error())
		return ""
	}
	if account == nil  {
		common.Logger.Warningln("has no account!")
		return ""
	}
	_json, err := simplejson.NewJson([]byte(account.Extra))
	if err != nil {
		common.Logger.Warningln("new json err:", err.Error())
		return ""
	}
	openId := _json.Get("openid").MustString()
	return openId
}
func (self *AccountService) GetByUserIdAndApp(userId int, app int) (*soda.Account, error) {
	account := &soda.Account{}
	r := common.SodaDB_R.Where("user_id = ? and `app` = ?", userId, app).First(account)
	if r.Error != nil {
		return nil, r.Error
	}
	return account, nil
}
