package controller

import (
	"crypto/md5"
	"encoding/hex"
	"github.com/spf13/viper"
	"gopkg.in/kataras/iris.v4"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/enity"
	"strconv"
	"time"
	"github.com/bitly/go-simplejson"
	"github.com/levigross/grequests"
	"maizuo.com/soda-manager/src/server/service"
	"maizuo.com/soda-manager/src/server/model"
	"encoding/json"
)

type AuthController struct {
}

var (
	auth_msg = map[string]string{
		"01120000": "获取key成功",

		"01120100": "更新用户信息成功",
		"01120101": "解析json出错",
		"01120102": "key已过期",
		"01120103": "key校验不通过",
		"01120104": "请求远程服务器出错",
		"01120105": "解析远程服务器数据出错",
		"01120106": "更新用户账号信息出错",

		"01120200": "更新用户信息成功",
		"01120201": "key已过期",
		"01120202": "非法key",
		"01120203": "redis中userinfo转json失败",
		"01120204": "获取用户信息有误",
		"01120205": "未关联用户信息",

	}
)

func (self *AuthController) CreateKey(ctx *iris.Context) {
	// 取出当前登录用户的ID
	signinUserId, _ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	prefix := viper.GetString("auth.prefix")
	// 加密
	md5Ctx := md5.New()
	md5Ctx.Write([]byte(strconv.Itoa(signinUserId)+time.Now().Format("060102150405")))
	key := hex.EncodeToString(md5Ctx.Sum(nil))
	// 将key和用户id绑定
	common.Redis.Set(prefix+"key:user:"+key+":", signinUserId, time.Duration(5*time.Minute))
	result := &enity.Result{"01120000", map[string]string{"key": key}, auth_msg["01120000"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx,result)
}

func (self *AuthController)UpdateWechatKey(ctx *iris.Context) {
	userCashAccountService := &service.UserCashAccountService{}
	userService := &service.UserService{}
	key := ctx.Param("key")
	params := simplejson.New()
	err := ctx.ReadJSON(&params)
	if err != nil {
		common.Logger.Debugln("解析json出错,err--->",err)
		result := &enity.Result{"01120101", struct {}{}, auth_msg["01120101"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}
	prefix := viper.GetString("auth.prefix")
	isExist := common.Redis.Exists(prefix+"key:user:"+key+":").Val()
	if !isExist{
		common.Logger.Debugln("key校验不通过")
		result := &enity.Result{"01120103", struct {}{}, auth_msg["01120103"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}
	userId,err := common.Redis.Get(prefix+"key:user:"+key+":").Int64()
	if err != nil {
		common.Logger.Debugln("key校验不通过,err--->",err)
		result := &enity.Result{"01120103", struct {}{}, auth_msg["01120103"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}
	token := params.Get("token").MustString()
	resp,err := grequests.Get(viper.GetString("auth.requestUrl"),
		&grequests.RequestOptions{
			Headers:map[string]string{
				"Origin":viper.GetString("auth.origin"),
				"Authorization":"Bearer "+token,
			},
		},
	)
	common.Logger.Debugln(resp.String())
	common.Logger.Debugln(resp.StatusCode)
	if err != nil || resp.StatusCode != 200 {
		common.Logger.Debugln("请求远程服务器出错,err--->",err)
		result := &enity.Result{"01120104", struct {}{}, auth_msg["01120104"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}

	userJson,err := simplejson.NewJson(resp.Bytes())
	if err != nil {
		common.Logger.Debugln("解析远程服务器数据出错,err--->",err)
		result := &enity.Result{"01120105", err, auth_msg["01120105"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}

	// 将用户信息更新到数据库中
	data,err := userJson.Get("data").Array()

	if err != nil {
		common.Logger.Debugln("远程服务器解析data数据出错,err------------->",err)
		result := &enity.Result{"01120105", err, auth_msg["01120105"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}
	extra := make(map[string]interface{})
	for _,_data := range data {
		_map := _data.(map[string]interface{})
		app,ok := _map["app"].(string)
		if ok && (app == "WECHAT") {
			// 取到微信的信息
			extraStr := _map["extra"].(string)
			json.Unmarshal([]byte(extraStr),&extra)

		}else{
			continue
		}
	}
	common.Logger.Debugln(extra)
	openId,ok := extra["openid"].(string)
	if !ok || openId == "" {
		// 代表没用户信息
		common.Logger.Debugln("远程服务器没有返回用户信息")
		result := &enity.Result{"01120105", struct {}{}, auth_msg["01120105"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}
	// 将返回的用户信息存放到redis中,轮询时根据key来获取openId从而判断是否绑定成功
	extraJson,err := json.Marshal(extra)
	if err != nil {
		common.Logger.Debugln("extra to json err------------------------>",err)
		result := &enity.Result{"01120105", struct {}{}, auth_msg["01120105"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}
	common.Redis.Set(prefix+"user:"+key+":",string(extraJson),3*time.Minute)
	userCashAccount := &model.UserCashAccount{
		UserId:int(userId),
		Account:openId,
		Type:2,
	}
	extraString,_ := json.Marshal(extra)
	user := &model.User{
		Extra:string(extraString),
		Model:model.Model{Id:int(userId)},
	}
	// 更新用户信息和账号信息没做到事务性
	err = userService.UpdateWechatInfo(user)
	if err != nil {
		common.Logger.Debugln("更新用户账号信息出错")
		result := &enity.Result{"01120106", struct {}{}, auth_msg["01120106"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}
	// 更新用户账号信息
	ok,err = userCashAccountService.UpdateByUserId(userCashAccount)
	if err != nil && !ok {
		common.Logger.Debugln("更新用户账号信息出错,err--->",err)
		result := &enity.Result{"01120106", struct {}{}, auth_msg["01120106"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}
	_user,_ := userService.Basic(int(userId))
	common.Logger.Debugln("更新用户账号信息成功")
	result := &enity.Result{Status:"01120100", Data:map[string]interface{}{
		"id":_user.Id,
		"name":_user.Name,
		"wechat":map[string]string{
			"name":extra["nickname"].(string),
			"avatorUrl":extra["headimgurl"].(string),
		},
	}, Msg:auth_msg["01120100"]}
	ctx.JSON(iris.StatusOK, result)
	return

}

func (self *AuthController)CheckKeyStatus(ctx *iris.Context) {
	userCashAccountService := &service.UserCashAccountService{}
	key := ctx.Param("key")
	prefix := viper.GetString("auth.prefix")
	signinUserId, _ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	redisKey := common.Redis.Get(prefix+"key:"+strconv.Itoa(signinUserId)+":")
	userExtra := common.Redis.Get(prefix+"user:"+key+":")
	common.Logger.Debugln("userInfo-------------val",userExtra.Val())
	if redisKey.Err() != nil && userExtra.Err() != nil {
		common.Logger.Debugln("key已过期")
		result := &enity.Result{"01120201", struct {}{}, auth_msg["01120201"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}
	common.Logger.Debugln("key------------------->",key)
	common.Logger.Debugln("redisKey------------------->",redisKey.String())
	if key != redisKey.Val(){
		common.Logger.Debugln("非法key")
		result := &enity.Result{"01120202", struct {}{}, auth_msg["01120202"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}
	userMap := make(map[string]interface{})
	err := json.Unmarshal([]byte(userExtra.Val()),&userMap)
	if err != nil {
		common.Logger.Debugln("redis中userinfo转json失败",err)
		result := &enity.Result{"01120205", struct {}{}, auth_msg["01120205"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}
	common.Logger.Debugln("userMap------------->",userMap)
	userCashAccount,err := userCashAccountService.BasicByUserId(signinUserId)
	if err != nil {
		common.Logger.Debugln("获取用户信息有误,err------------>",err)
		result := &enity.Result{"01120204", struct {}{}, auth_msg["01120204"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}

	// redis的openId和用户的账号不相等,证明还没
	if userCashAccount.Account != userMap["openId"].(string) {
		common.Logger.Debugln("未关联用户信息")
		result := &enity.Result{"01120205", struct {}{}, auth_msg["01120205"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}

	common.Logger.Debugln("绑定用户信息成功")
	result := &enity.Result{Status:"01120200", Data:map[string]interface{}{
		"id":userCashAccount.Id,
		"name":userCashAccount.RealName,
		"wechat":map[string]interface{}{
			"name":userMap["nickname"],
			"avatorUrl":userMap["headImgUrl"],
		},
	}, Msg:auth_msg["01120200"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx,result)
	return
}

