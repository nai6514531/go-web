package alipay

import (
	"crypto/md5"
	"encoding/hex"
	"sort"
	"fmt"
	"maizuo.com/soda-manager/src/server/common"
	"strings"
	"github.com/spf13/viper"
)

type AlipayKit struct {
}

/**
	支付宝批量付款接口md5计算签名的函数
 */
func CreateSign(mReq interface{}) string {
	apiKey := viper.GetString("pay.aliPay.key")//os.Getenv("ALIPAYKEY")

	//STEP 1, 对key进行升序排序.
	sorted_keys := make([]string, 0)
	if mReq == nil {
		return ""
	}

	switch mValue := mReq.(type) {
	case map[string]interface{}:
		for k, _ := range mValue {
			sorted_keys = append(sorted_keys, k)
		}
	case map[string]string:
		for k, _ := range mValue {
			sorted_keys = append(sorted_keys, k)
		}
	default:
		return ""
	}

	sort.Strings(sorted_keys)
	//STEP2, 对key=value的键值对用&连接起来，略过空值
	var signStrings string
	for _, k := range sorted_keys {
		value := ""
		switch mValue := mReq.(type) {
		case map[string]interface{}:
			fmt.Printf("k=%v, v=%v\n", k, mValue[k])
			value = fmt.Sprintf("%v", mValue[k])
		case map[string]string:
			fmt.Printf("k=%v, v=%v\n", k, mValue[k])
			value = fmt.Sprintf("%v", mValue[k])
		}


		if value != "" {
			signStrings = signStrings + k + "=" + value + "&"
		}
	}

	if strings.HasSuffix(signStrings, "&") {
		signStrings = signStrings[: len(signStrings) - 1 ]
	}

	//STEP3, 在键值对的最后加上key=API_KEY
	if apiKey != "" {
		signStrings = signStrings + apiKey
	}
	common.Logger.Debugln("signStrings=============", signStrings)
	//STEP4, 进行MD5签名并且将所有字符转为大写.
	md5Ctx := md5.New()
	md5Ctx.Write([]byte(signStrings))
	cipherStr := md5Ctx.Sum(nil)
	sign := hex.EncodeToString(cipherStr)
	//upperSign := strings.ToUpper(hex.EncodeToString(cipherStr))
	common.Logger.Debug("sign====================================", sign)
	return sign
}

/**
	签名校验方法
 */
func VerifySign(data interface{}, sign string) bool {
	_sign := ""
	switch value := data.(type) {
	case map[string]interface{}:
		_sign = CreateSign(value)
	case map[string]string:
		_sign = CreateSign(value)
	}
	common.Logger.Warningln("计算出来的sign: %v", _sign)
	common.Logger.Warningln("支付宝通知sign: %v", sign)
	if sign == _sign {
		common.Logger.Warningln("签名校验通过!")
		return true
	}
	common.Logger.Warningln("签名校验失败!")
	return false
}
