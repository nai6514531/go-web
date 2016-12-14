package export

import (
	"github.com/tealeg/xlsx"
	"github.com/spf13/viper"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
	"time"
)

type DailyBillExport struct {
}

func (self *DailyBillExport) Excel(list *[]*model.DailyBill) {
	var row *xlsx.Row
	//var cell *xlsx.Cell
	path := viper.GetString("export.path")
	name := path + "/" + time.Now().Format("20060102150405") + ".xlsx"
	file := xlsx.NewFile()
	sheet, err := file.AddSheet("结算管理列表")
	if err != nil {
		common.Logger.Debug("err1======", err.Error())
	}
	for _, _bill := range *list {
		accountStr := ""
		slice := make([]interface{}, 0)
		row = sheet.AddRow()
		//cell = row.AddCell()
		//cell.Value = strconv.Itoa(_bill.Id)
		if _bill.AccountType == 1 {
			accountStr = _bill.RealName + " | 账号:" + _bill.Account + " | 手机号:" + _bill.Mobile
		}else if _bill.AccountType == 3 {
			accountStr = "户名:" + _bill.RealName + " | " + _bill.BankName + " | " + _bill.Account + " | " + _bill.Mobile

		}
		slice = append(slice, _bill.Id, _bill.UserName, _bill.TotalAmount/100, _bill.AccountName, _bill.BillAt, accountStr, _bill.OrderCount)
		r := row.WriteSlice(slice, 1)
		common.Logger.Debug("r==========", r)

	}
	err = file.Save(name)
	if err != nil {
		common.Logger.Debug("err2======", err.Error())
	}
}
