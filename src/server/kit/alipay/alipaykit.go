package alipay

import (
	"crypto/md5"
	"strings"
	"encoding/hex"
	"sort"
	"fmt"
	"os"
	"maizuo.com/soda-manager/src/server/common"
)

type AlipayKit struct {
}

/**
	微信支付计算签名的函数
 */
func CreateSign(mReq map[string]interface{}) (sign string) {
	//apiKey := viper.GetString("pay.wechat.api-key")
	apiKey := os.Getenv("APIKEY")
	common.Logger.Warningln("微信支付签名计算, API KEY:", apiKey)
	//STEP 1, 对key进行升序排序.
	sorted_keys := make([]string, 0)
	for k, _ := range mReq {
		sorted_keys = append(sorted_keys, k)
	}
	sort.Strings(sorted_keys)
	//STEP2, 对key=value的键值对用&连接起来，略过空值
	var signStrings string
	for _, k := range sorted_keys {
		fmt.Printf("k=%v, v=%v\n", k, mReq[k])
		value := fmt.Sprintf("%v", mReq[k])
		if value != "" {
			signStrings = signStrings + k + "=" + value + "&"
		}
	}
	//STEP3, 在键值对的最后加上key=API_KEY
	if apiKey != "" {
		signStrings = signStrings + "key=" + apiKey
	}
	//STEP4, 进行MD5签名并且将所有字符转为大写.
	md5Ctx := md5.New()
	md5Ctx.Write([]byte(signStrings))
	cipherStr := md5Ctx.Sum(nil)
	upperSign := strings.ToUpper(hex.EncodeToString(cipherStr))
	return upperSign
}

/**
	签名校验方法
 */
func VerifySign(data map[string]interface{}, sign string) bool {
	_sign := CreateSign(data)
	common.Logger.Debugln("计算出来的sign: %v", _sign)
	common.Logger.Debugln("微信通知sign: %v", sign)
	if sign == _sign {
		common.Logger.Debugln("签名校验通过!")
		return true
	}
	common.Logger.Debugln("签名校验失败!")
	return false
}
