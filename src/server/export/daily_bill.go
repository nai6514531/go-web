package export

import (
	"github.com/tealeg/xlsx"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
	"time"
	"strings"
	"os"
	"maizuo.com/soda-manager/src/server/kit/functions"
)

type DailyBillExport struct {
}

func (self *DailyBillExport) Excel(roleId int, list *[]*model.DailyBill) (string, error) {
	var row *xlsx.Row
	type values []interface{}
	root, _ := os.Getwd()
	path := root + viper.GetString("export.loadsPath")
	_, err := functions.CreatePathIfNotExists(path)
	if err != nil {
		return "", err
	}
	name := time.Now().Format("20060102150405") + ".xlsx"
	url := path + "/" + name
	common.Logger.Debug("url========", url)
	file := xlsx.NewFile()
	sheet, err := file.AddSheet("结算管理列表")
	if err != nil {
		return "", err
	}

	s := values{"账单号", "运营商", "金额", "收款方式", "账期", "账户信息", "订单量", "状态"}
	row = sheet.AddRow()
	row.WriteSlice(&s, -1)

	for _, _bill := range *list {
		account := make([]string, 0)
		accountStr := ""
		statusStr := ""
		row = sheet.AddRow()
		if _bill.AccountType == 1 {
			if _bill.RealName != "" {
				account = append(account, _bill.RealName)
			}
			if _bill.Account != "" {
				account = append(account, "账号:"+_bill.Account)
			}
			if _bill.Mobile != "" {
				account = append(account, "手机号:"+_bill.Mobile)
			}
		}else if _bill.AccountType == 3 {
			if _bill.RealName != "" {
				account = append(account, "户名:" + _bill.RealName)
			}
			if _bill.BankName != "" {
				account = append(account, _bill.BankName)
			}
			if _bill.Account != "" {
				account = append(account, _bill.Account)
			}
			if _bill.Mobile != "" {
				account = append(account, _bill.Mobile)
			}
		}

		switch _bill.Status {
		case 0:
			statusStr = "未结账"
		case 1:
			if roleId == 3 {
				statusStr = "未结账"
			}else {
				statusStr = "已申请结账"
			}
		case 2:
			statusStr = "已结账"
		case 3:
			statusStr = "结账中"
		case 4:
			statusStr = "结账失败"
		}
		accountStr = strings.Join(account, " | ")
		_time, err := time.Parse(time.RFC3339, _bill.BillAt)
		if err != nil {
			common.Logger.Warning("soda-manager导出结算列表时间转换失败：", err.Error())
		}
		_timeStr := _time.Format("2006-01-02")
		s := values{_bill.Id, _bill.UserName, float64(_bill.TotalAmount)/100, _bill.AccountName, _timeStr, accountStr, _bill.OrderCount, statusStr}
		row.WriteSlice(&s, -1)
	}
	err = file.Save(url)
	if err != nil {
		return "", err
	}
	return name, nil
}


