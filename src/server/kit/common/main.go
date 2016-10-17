package common

import (
	"github.com/spf13/viper"
	"github.com/kataras/iris"
)

type CommonKit struct {

}

func (CommonKit)GetUserId() (int) {
	return iris.Context{}.Session().GetInt(viper.GetString("server.session.user.user-id-key"))
}
