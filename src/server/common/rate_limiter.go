package common

import (
	"github.com/garyburd/redigo/redis"
	"github.com/kataras/iris"
	"github.com/spf13/viper"
	"github.com/ulule/limiter"
	"maizuo.com/smart-cinema/src/server/middleware"
)

func SetUpRateLimiter() {

	addr := viper.GetString("server.rate-limiter.redis.addr")
	password := viper.GetString("server.rate-limiter.redis.password")
	database := viper.GetString("server.rate-limiter.redis.database")
	prefix := viper.GetString("server.rate-limiter.redis.prefix")
	maxRetry := viper.GetInt("server.rate-limiter.redis.max-retry")
	_rate := viper.GetString("server.rate-limiter.rate")

	rate, err := limiter.NewRateFromFormatted(_rate)
	if err != nil {
		panic(err)
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
		panic(err)
	}

	iris.UseFunc(middleware.NewRateLimiter(limiter.NewLimiter(store, rate)).MiddlewareFunc)
}
