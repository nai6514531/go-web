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
		"01120107": "key已绑定用户",

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
	common.Redis.Set(prefix+"key:user:"+key+":", signinUserId, time.Duration(24*time.Hour))
	result := &enity.Result{"01120000", map[string]string{"key": key}, auth_msg["01120000"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx,result)
}

func (self *AuthController)UpdateWechatKey(ctx *iris.Context) {
	userService := &service.UserService{}
	key := ctx.Param("key")
	params := simplejson.New()
	err := ctx.ReadJSON(&params)
	if err != nil {
		result := &enity.Result{"01120101", err, auth_msg["01120101"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}
	prefix := viper.GetString("auth.prefix")

	isExist := common.Redis.Exists(prefix+"key:user:"+key+":").Val()
	if !isExist{
		result := &enity.Result{"01120103", nil, auth_msg["01120103"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}
	userId,err := common.Redis.Get(prefix+"key:user:"+key+":").Int64()
	if err != nil {
		common.Logger.Debugln("key校验不通过,err--->",err)
		result := &enity.Result{"01120103", err, auth_msg["01120103"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}
	token := params.Get("token").MustString()
	headers := map[string]string{
		"Origin":viper.GetString("auth.origin"),
		"Authorization":"Bearer "+token,
	}
	common.Logger.Debugln("gRequests headers --------------->",headers)
	common.Logger.Debugln("origin----",viper.GetString("auth.origin"))
	common.Logger.Debugln("origin----",token)
	common.Logger.Debugln("url-------", viper.GetString("auth.requestUrl"))
	resp,err := grequests.Get(viper.GetString("auth.requestUrl"),
		&grequests.RequestOptions{
			Headers:headers,
		},
	)
	common.Logger.Debugln("resp.String() ---------------->",resp.String())
	common.Logger.Debugln("resp.StatusCode() ---------------->",resp.StatusCode)

	if err != nil {
		common.Logger.Debugln("请求远程服务器出错,err--->",err)
		result := &enity.Result{"01120104", err, auth_msg["01120104"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}

	respMap,err := simplejson.NewJson(resp.Bytes())
	if err != nil {
		common.Logger.Debugln("解析远程服务器数据出错,err--->",err)
		result := &enity.Result{"01120105", err, auth_msg["01120105"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}
	// 将请求到的错误信息原样返回
	if respMap.Get("status").MustString() != "OK" {
		result := &enity.Result{
			Status:respMap.Get("status").MustString(),
			Data:respMap.Get("msg").MustString(),
			Msg:respMap.Get("msg").MustString()}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}
	data,err := respMap.Get("data").Array()
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
		result := &enity.Result{"01120105", err, auth_msg["01120105"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}
	if common.Redis.Exists(prefix+"user:"+key+":").Val() == true {
		userExtra := common.Redis.Get(prefix+"user:"+key+":")
		userMap := make(map[string]interface{})
		err = json.Unmarshal([]byte(userExtra.Val()),&userMap)
		if err != nil {
			result := &enity.Result{"01120205", err, auth_msg["01120205"]}
			ctx.JSON(iris.StatusOK, result)
			common.Log(ctx,result)
			return
		}
		if userMap["openid"].(string) != extra["openid"].(string) {
			result := &enity.Result{"01120107", nil, auth_msg["01120107"]}
			ctx.JSON(iris.StatusOK, result)
			common.Log(ctx,result)
			return
		}
	}
	// 将返回的用户信息存放到redis中,轮询时根据key来获取openId从而判断是否绑定成功
	extraJson,err := json.Marshal(extra)
	if err != nil {
		common.Logger.Debugln("extra to json err------------------------>",err)
		result := &enity.Result{"01120105", err, auth_msg["01120105"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}
	common.Redis.Set(prefix+"user:"+key+":",string(extraJson),24*time.Hour)

	_user,_ := userService.Basic(int(userId))
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
	userService := &service.UserService{}
	key := ctx.Param("key")
	prefix := viper.GetString("auth.prefix")
	signinUserId, _ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	userId,err := common.Redis.Get(prefix+"key:user:"+key+":").Int64()
	userExtra := common.Redis.Get(prefix+"user:"+key+":")
	common.Logger.Debugln("userInfo-------------val",userExtra.Val())
	if userExtra.Err() != nil {
		result := &enity.Result{"01120205", userExtra.Err(), auth_msg["01120205"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}
	if int(userId) != signinUserId{
		result := &enity.Result{"01120202", userId, auth_msg["01120202"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}
	userMap := make(map[string]interface{})
	err = json.Unmarshal([]byte(userExtra.Val()),&userMap)
	if err != nil {
		result := &enity.Result{"01120205", err, auth_msg["01120205"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}
	user,err := userService.Basic(signinUserId)
	if err != nil {
		result := &enity.Result{"01120204", err, auth_msg["01120204"]}
		ctx.JSON(iris.StatusOK, result)
		common.Log(ctx,result)
		return
	}

	result := &enity.Result{Status:"01120200", Data:map[string]interface{}{
		"id":user.Id,
		"name":user.Name,
		"wechat":map[string]interface{}{
			"name":userMap["nickname"],
			"avatorUrl":userMap["headimgurl"],
		},
	}, Msg:auth_msg["01120200"]}
	ctx.JSON(iris.StatusOK, result)
	common.Log(ctx,result)
	return
}

