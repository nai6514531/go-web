package middleware

import (
	"github.com/kataras/iris"
	"time"
)

var LoggerHandler = func(ctx *iris.Context) {
	startAt := time.Now().UnixNano() / 1000000
	ctx.Set("startAt", startAt)
	ctx.Next()
}
