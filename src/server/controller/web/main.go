package controller

import (
	"fmt"
	"github.com/afocus/captcha"
	"github.com/kataras/iris"
	"github.com/spf13/viper"
	"image/color"
	"image/png"
)

type WebController struct {
}

func (self *WebController) Index(ctx *iris.Context) {
	userIdSess := ctx.Session().GetInt(viper.GetString("server.session.user.user-id-key"))
	userSess := ctx.Session().GetString(viper.GetString("server.session.user.all-info-key"))
	if userIdSess >= 0 {
		ctx.Render("index.html", map[string]interface{}{"title": "首页", "user": userSess})
	} else {
		ctx.Render("signin.html", map[string]interface{}{"title": "登录"})
	}
}

func (self *WebController) Signin(ctx *iris.Context) {
	ctx.Render("signin.html", map[string]interface{}{"title": "登录"})
}

func (self *WebController) Captcha(ctx *iris.Context) {
	_cap := captcha.New()
	fontPath := viper.GetString("server.captcha.font-path")
	captchaKey := viper.GetString("server.captcha.Key")
	if err := _cap.SetFont(fontPath); err != nil {
		panic(err.Error())
	}
	_cap.SetSize(128, 64)
	_cap.SetDisturbance(captcha.MEDIUM)
	_cap.SetFrontColor(color.RGBA{0, 0, 0, 255})
	_cap.SetBkgColor(color.RGBA{255, 255, 255, 0}, color.RGBA{255, 255, 255, 0})
	img, _captcha := _cap.Create(4, captcha.NUM)
	png.Encode(ctx.Response.BodyWriter(), img)
	ctx.Session().Set(captchaKey, _captcha)
	fmt.Println(_captcha)
}
