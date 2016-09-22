package controller

import (
	"github.com/kataras/iris"
	"maizuo.com/smart-cinema/src/server/service"
	"strconv"
	"maizuo.com/smart-cinema/src/server/model"
)

type UserController struct {
}

func (self *UserController) List(ctx *iris.Context) {
	ctx.Write("from user.List")
}

func (self *UserController) Basic(ctx *iris.Context) {
	id, _ := strconv.Atoi(ctx.Param("id"))
	var userService = &service.UserService{}
	user, e := userService.Basic(id)
	if e != nil {
		println(e.Error())
		ctx.JSON(iris.StatusOK, user)
	}
	ctx.JSON(iris.StatusOK, user)
	//ctx.Write("from user.Detail:" + id)
}

func (self *UserController) Delete(ctx *iris.Context) {
	id, _ := strconv.Atoi(ctx.Param("id"))
	var userService = &service.UserService{}
	r, e := userService.Delete(id)
	if e != nil {
		print(e.Error())
	}
	ctx.JSON(iris.StatusOK, r)
}

func (sefl *UserController) Create(ctx *iris.Context) {
	var userService = &service.UserService{}
	user := &model.User{}
	ctx.ReadJSON(user)
	r, _ := userService.Create(user)
	ctx.JSON(iris.StatusOK, r)
}

func (sefl *UserController) Update(ctx *iris.Context) {
	id, _ := strconv.Atoi(ctx.Param("id"))
	var userService = &service.UserService{}
	user, _ := userService.Basic(id)
	r, _ := userService.Update(user)
	ctx.JSON(iris.StatusOK, r)
}
