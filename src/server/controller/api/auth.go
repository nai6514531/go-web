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
)

type AuthController struct {
}

var (
	auth_msg = map[string]string{
		"01120000": "获取key成功",
		"01120100": "更新用户信息成功",
		"01120101": "解析json出错",
	}
)

func (self *AuthController) CreateKey(ctx *iris.Context) {
	// 取出当前登录用户的ID
	signinUserId, _ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	prefix := viper.GetString("auth.prefix")
	// 加密
	md5Ctx := md5.New()
	md5Ctx.Write([]byte(strconv.Itoa(signinUserId)))
	key := hex.EncodeToString(md5Ctx.Sum(nil))
	// 将key存放
	common.Redis.Set(prefix+"key:"+strconv.Itoa(signinUserId), key, time.Duration(10*time.Minute))
	result := &enity.Result{"01120000", map[string]string{"key": key}, auth_msg["01120000"]}
	ctx.JSON(iris.StatusOK, result)
}

func (self *AuthController)UpdateWechatKey(ctx *iris.Context) {
	userCashAccountService := &service.UserCashAccountService{}
	params := simplejson.New()
	err := ctx.ReadJSON(&params)
	if err != nil {
		common.Logger.Debugln("解析json出错")
		result := &enity.Result{"01120000", struct {}{}, auth_msg["01120000"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	paramKey := params.Get("key").MustString()
	// 取出当前登录用户的ID
	signinUserId, _ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	prefix := viper.GetString("auth.prefix")
	redisKey := common.Redis.Get(prefix+"key:"+strconv.Itoa(signinUserId))
	if redisKey.Err() != nil {
		common.Logger.Debugln("key已过期")
		result := &enity.Result{"01120000", struct {}{}, auth_msg["01120000"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	key := redisKey.String()
	if paramKey != key {
		common.Logger.Debugln("key校验不通过")
		result := &enity.Result{"01120000", struct {}{}, auth_msg["01120000"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	token := params.Get("token").MustString()
	resp,err := grequests.Get("url",
		&grequests.RequestOptions{
			JSON:token,
			Headers:map[string]string{
				"Content-Type":"application/json",
			},
		},
	)
	if err != nil || resp.StatusCode != 200 {
		common.Logger.Debugln("请求远程服务器出错")
		result := &enity.Result{"01120000", struct {}{}, auth_msg["01120000"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	// TODO 暂且先放着
	openId := resp.Bytes()
	userCashAccount := &model.UserCashAccount{
		UserId:signinUserId,
		Account:string(openId),
		Type:2,
	}
	// 将openId存放到redis中,轮询时根据key来获取openId从而判断是否绑定成功
	common.Redis.Set(prefix+"openId:"+key,openId,5*time.Minute)
	// 更新用户账号信息
	ok,err := userCashAccountService.UpdateByUserId(userCashAccount)
	if err != nil && !ok {
		common.Logger.Debugln("更新用户账号信息出错")
		result := &enity.Result{"01120000", struct {}{}, auth_msg["01120000"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	common.Logger.Debugln("更新用户账号信息成功")
	result := &enity.Result{"01120000", struct {}{}, auth_msg["01120000"]}
	ctx.JSON(iris.StatusOK, result)
	return

}

func (self *AuthController)CheckKeyStatus(ctx *iris.Context) {
	userCashAccountService := &service.UserCashAccountService{}
	key := ctx.Param("key")
	prefix := viper.GetString("auth.prefix")
	signinUserId, _ := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	redisKey := common.Redis.Get(prefix+"key:"+strconv.Itoa(signinUserId))
	redisOpenId := common.Redis.Get(prefix+"openId:"+key)
	if redisKey.Err() != nil && redisOpenId.Err() != nil {
		common.Logger.Debugln("key已过期")
		result := &enity.Result{"01120000", struct {}{}, auth_msg["01120000"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	if key != redisKey.String() {
		common.Logger.Debugln("非法key")
		result := &enity.Result{"01120000", struct {}{}, auth_msg["01120000"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}

	userCashAccount,err := userCashAccountService.BasicByUserId(signinUserId)
	if err != nil {
		common.Logger.Debugln("获取用户信息有误")
		result := &enity.Result{"01120000", struct {}{}, auth_msg["01120000"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	// redis的openId和用户的账号不相等,证明还没
	if userCashAccount.Account != redisOpenId.String() {
		common.Logger.Debugln("未关联用户信息")
		result := &enity.Result{"01120202", struct {}{}, auth_msg["01120000"]}
		ctx.JSON(iris.StatusOK, result)
		return
	}
	common.Logger.Debugln("绑定用户信息成功")
	result := &enity.Result{"01120000", struct {}{}, auth_msg["01120000"]}
	ctx.JSON(iris.StatusOK, result)
	return
}
