package sms

import (
	"fmt"
	"crypto/md5"
	"encoding/hex"
	"sort"
	"maizuo.com/soda-manager/src/server/common"
	"strings"
	"strconv"
	"maizuo.com/soda-manager/src/server/kit/functions"
)

func CreateSign(secret string, mReq interface{}) string {
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
			signStrings = signStrings + k + value
		}
	}

	//STEP3, 在键值对的前后加上key=secret
	if secret != "" {
		signStrings = secret + signStrings + secret
	}
	common.Logger.Debugln("signStrings=============", signStrings)
	md5Ctx := md5.New()
	md5Ctx.Write([]byte(signStrings))
	cipherStr := md5Ctx.Sum(nil)
	sign :=strings.ToUpper( hex.EncodeToString(cipherStr))
	common.Logger.Debugln("sign====================================", sign)
	return sign
}

func Code() string {
	return strconv.FormatInt(functions.RandInt64(100000, 999999), 10)
}

func saveCode(code string) string {
	return ""
}
