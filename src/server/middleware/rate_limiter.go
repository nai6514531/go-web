package middleware

import (
	"github.com/kataras/iris"
	"github.com/ulule/limiter"
	"strconv"
	"time"
)

type RateLimiter struct {
	Limiter *limiter.Limiter
}

func NewRateLimiter(limiter *limiter.Limiter) *RateLimiter {
	return &RateLimiter{
		Limiter: limiter,
	}
}

func (self *RateLimiter) MiddlewareFunc(ctx *iris.Context) {
	key := ctx.RequestIP() + ":" + ctx.PathString() + ":" + ctx.MethodString()
	context, err := self.Limiter.Get(key)
	if err != nil {
		panic(err.Error())
	}
	ctx.SetHeader("X-RateLimit-Limit", strconv.FormatInt(context.Limit, 10))
	ctx.SetHeader("X-RateLimit-Remaining", strconv.FormatInt(context.Remaining, 10))
	ctx.SetHeader("X-RateLimit-Reset", strconv.FormatInt(context.Reset, 10))

	startAt := time.Now().UnixNano() / 1000000
	ctx.Set("startAt", startAt)

	// That can be useful to access rate limit context in views.
	//r.Env["ratelimit:limit"] = context.Limit
	//r.Env["ratelimit:remaining"] = context.Remaining
	//r.Env["ratelimit:reset"] = context.Reset

	if context.Reached {
		ctx.EmitError(iris.StatusTooManyRequests)
		return
	}

	ctx.Next()
}
