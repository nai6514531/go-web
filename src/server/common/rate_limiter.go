package common

import (
	"github.com/garyburd/redigo/redis"
	"github.com/kataras/iris"
	"github.com/spf13/viper"
	"github.com/ulule/limiter"
	"maizuo.com/soda-manager/src/server/middleware"
)

func SetUpRateLimiter() {

	addr := viper.GetString("server.rateLimiter.redis.addr")
	password := viper.GetString("server.rateLimiter.redis.password")
	database := viper.GetString("server.rateLimiter.redis.database")
	prefix := viper.GetString("server.rateLimiter.redis.prefix")
	maxRetry := viper.GetInt("server.rateLimiter.redis.maxRetry")
	_rate := viper.GetString("server.rateLimiter.rate")

	rate, err := limiter.NewRateFromFormatted(_rate)
	if err != nil {
		panic(err.Error())
	}

	pool := redis.NewPool(func() (redis.Conn, error) {
		c, err := redis.Dial("tcp", addr)
		if err != nil {
			return nil, err
		}
		if err != nil {
			return nil, err
		}
		if password != "" {
			if _, err := c.Do("AUTH", password); err != nil {
				c.Close()
				return nil, err
			}
		}
		if c.Do("SELECT", database); err != nil {
			c.Close()
			return nil, err
		}
		return c, err
	}, 100)

	store, err := limiter.NewRedisStoreWithOptions(
		pool,
		limiter.StoreOptions{Prefix: prefix, MaxRetry: maxRetry})

	if err != nil {
		panic(err.Error())
	}

	iris.UseFunc(middleware.NewRateLimiter(limiter.NewLimiter(store, rate)).MiddlewareFunc)
}
