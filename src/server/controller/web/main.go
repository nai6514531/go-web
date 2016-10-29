package controller

import (
	"github.com/afocus/captcha"
	"github.com/kataras/iris"
	"github.com/spf13/viper"
	"image/color"
	"image/png"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/service"
)

type WebController struct {
}

func (self *WebController) Index(ctx *iris.Context) {
	userId := ctx.Session().GetInt(viper.GetString("server.session.user.id"))
	if userId >= 0 {
		userMap := make(map[string]interface{})
		userService := &service.UserService{}
		user, err := userService.Basic(userId)
		if err != nil {
			common.Logger.Errorln("拉取用户详情异常:", userId, err.Error())
			ctx.EmitError(iris.StatusInternalServerError)
			return
		}
		roleService := &service.RoleService{}
		role, err := roleService.BasicByUserId(userId)
		if err != nil {
			common.Logger.Errorln("拉取用户角色详情异常:", userId, err.Error())
			ctx.EmitError(iris.StatusInternalServerError)
			return
		}
		memuService := &service.MenuService{}
		menu, err := memuService.ListByUserId(userId)
		if err != nil {
			common.Logger.Errorln("拉取用户菜单列表异常:", userId, err.Error())
			ctx.EmitError(iris.StatusInternalServerError)
			return
		}
		_user := *user
		userMap["id"] = _user.Id
		userMap["name"] = _user.Name
		userMap["mobile"] = _user.Mobile
		userMap["account"] = _user.Account
		userMap["contact"] = _user.Contact
		userMap["address"] = _user.Address
		userMap["email"] = _user.Email
		userMap["parentId"] = _user.ParentId
		userMap["status"] = _user.Status
		userMap["telephone"] = _user.Telephone
		userMap["age"] = _user.Age
		userMap["gender"] = _user.Gender
		userMap["role"] = role
		userMap["menu"] = menu
		ctx.Render("index.html", struct{ User interface{} }{User: userMap})
	} else {
		ctx.Render("signin.html", map[string]interface{}{"title": "登录"})
	}
}

func (self *WebController) Signin(ctx *iris.Context) {
	ctx.Render("signin.html", map[string]interface{}{"title": "登录"})
}

func (self *WebController) Stat(ctx *iris.Context) {
	ctx.Render("stat.html", map[string]interface{}{"title": "统计"})
}

func (self *WebController) Captcha(ctx *iris.Context) {
	_cap := captcha.New()
	fontPath := viper.GetString("server.captcha.fontPath")
	captchaKey := viper.GetString("server.captcha.key")
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
}
