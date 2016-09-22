package pay

import (
	"crypto/md5"
	"encoding/hex"
	"time"
	"math/rand"
	"github.com/spf13/viper"
	"sort"
	"net/url"
	"hash"
	"bufio"
	"bytes"
	"fmt"
	"strings"
	"encoding/xml"
	"github.com/levigross/grequests"
	"maizuo.com/smart-cinema/src/server/common"
)

type WeChatPayKit struct {

}

//微信支付计算签名的函数
func createSign(mReq map[string]interface{}) (sign string) {
	apiKey := viper.GetString("pay.wechat.apiKey")
	fmt.Println("微信支付签名计算, API KEY:", apiKey)
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

func VerifySign(data map[string]interface{}, sign string) bool {
	_sign := createSign(data)
	common.Logger.Debugln("计算出来的sign: %v", _sign)
	common.Logger.Debugln("微信通知sign: %v", sign)
	if sign == _sign {
		common.Logger.Debugln("签名校验通过!")
		return true
	}
	common.Logger.Debugln("签名校验失败!")
	return false
}

func _createSign(params map[string]interface{}, apiKey string, fn func() hash.Hash) string {
	if fn == nil {
		fn = md5.New
	}
	h := fn()
	bufw := bufio.NewWriterSize(h, 128)

	keys := make([]string, 0, len(params))
	for k := range params {
		if k == "sign" {
			continue
		}
		keys = append(keys, k)
	}
	sort.Strings(keys)

	for _, k := range keys {
		v := params[k]
		if v == "" {
			continue
		}
		bufw.WriteString(k)
		bufw.WriteByte('=')
		bufw.WriteString(v.(string))
		bufw.WriteByte('&')
	}
	bufw.WriteString("key=")
	bufw.WriteString(apiKey)

	bufw.Flush()
	signature := make([]byte, hex.EncodedLen(h.Size()))
	hex.Encode(signature, h.Sum(nil))
	return string(bytes.ToUpper(signature))
}

func createNonceStr(_len int) (string) {
	str := "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	bytes := []byte(str)
	result := []byte{}
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	for i := 0; i < _len; i++ {
		result = append(result, bytes[r.Intn(len(bytes))])
	}
	text := string(result)
	ctx := md5.New()
	ctx.Write([]byte(text))
	return hex.EncodeToString(ctx.Sum(nil))
}

func (self WeChatPayKit) CreateNativePayURL(tradeNo  string) string {
	nonceStr := createNonceStr(32)
	appId := viper.GetString("pay.wechat.appId")
	mchId := viper.GetString("pay.wechat.mchId")
	timeStamp := time.Now().In(time.FixedZone("Asia/Shanghai", 8 * 60 * 60)).Unix()//.Format("20060102150405")
	m := make(map[string]interface{}, 5)
	m["appid"] = appId
	m["mch_id"] = mchId
	m["product_id"] = tradeNo
	m["time_stamp"] = timeStamp
	m["nonce_str"] = nonceStr
	//sign := createSign(m, apiKey, nil)
	sign := createSign(m)
	return "weixin://wxpay/bizpayurl?sign=" + sign +
		"&appid=" + url.QueryEscape(appId) +
		"&mch_id=" + url.QueryEscape(mchId) +
		"&product_id=" + url.QueryEscape(tradeNo) +
		"&time_stamp=" + url.QueryEscape(string(timeStamp)) +
		"&nonce_str=" + url.QueryEscape(nonceStr)
}

func (self WeChatPayKit)CreateUnifiedOrder() {
	appId := viper.GetString("pay.wechat.appId")
	unifyOrderRequest := &UnifyOrderRequest{
		AppId :appId, //微信开放平台我们创建出来的app的app id
		Body :"商品名",
		MchId : "商户编号",
		NonceStr : "your nonce",
		NotifyUrl : "www.yourserver.com/wxpayNotify",
		TradeType : "APP",
		SpbillCreateIp : "xxx.xxx.xxx.xxx",
		TotalFee : 10, //单位是分，这里是1毛钱
		OutTradeNo : "后台系统单号",
	}
	m := make(map[string]interface{}, 0)
	m["appid"] = unifyOrderRequest.AppId
	m["body"] = unifyOrderRequest.Body
	m["mch_id"] = unifyOrderRequest.MchId
	m["notify_url"] = unifyOrderRequest.NotifyUrl
	m["trade_type"] = unifyOrderRequest.TradeType
	m["spbill_create_ip"] = unifyOrderRequest.SpbillCreateIp
	m["total_fee"] = unifyOrderRequest.TotalFee
	m["out_trade_no"] = unifyOrderRequest.OutTradeNo
	m["nonce_str"] = unifyOrderRequest.NonceStr
	unifyOrderRequest.Sign = createSign(m)
	requestBytes, err := xml.Marshal(unifyOrderRequest)
	if err != nil {
		fmt.Println("以xml形式编码发送错误, 原因:", err.Error())
		return
	}
	str_req := string(requestBytes)
	str_req = strings.Replace(str_req, "UnifyOrderRequest", "xml", -1)
	requestBytes = []byte(str_req)
	response, err := grequests.Post("https://smart-cinema.maizuo.com:8080/api/pay/unifiedorder", &grequests.RequestOptions{
		XML:requestBytes,
		Headers:map[string]string{
			"Accept": "application/xml",
			"Content-Type": "application/xml;charset=utf-8",
		},
	})
	if err != nil {
		fmt.Println("请求微信支付统一下单接口发送错误, 原因:", err.Error())
		return
	}
	common.Logger.Infoln(response.String())
}
