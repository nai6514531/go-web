package common

import (
	"gopkg.in/kataras/iris.v4"
	"github.com/spf13/viper"
	"time"
	"github.com/kataras/go-sessions/sessiondb/redis"
	"github.com/kataras/go-sessions/sessiondb/redis/service"
)

func SetUpSession() {

	iris.Config.Sessions.Cookie = viper.GetString("server.session.cookie")
	iris.Config.Sessions.Expires = time.Duration(viper.GetInt("server.session.expires")) * time.Second
	iris.Config.Sessions.DisableSubdomainPersistence = true

	db := redis.New(service.Config{
		Network:       service.DefaultRedisNetwork,
		Addr:          viper.GetString("server.session.redis.addr"),
		Password:      viper.GetString("server.session.redis.password"),
		Database:      viper.GetString("server.session.redis.database"),
		MaxIdle:       viper.GetInt("server.session.redis.maxIdle"),
		MaxActive:     viper.GetInt("server.session.redis.maxActive"),
		IdleTimeout:   time.Duration(viper.GetInt("server.session.redis.idleTimeout")) * time.Second,
		Prefix:        viper.GetString("server.session.redis.prefix"),
		MaxAgeSeconds: viper.GetInt("server.session.redis.maxAgeSeconds"),
	})

	iris.UseSessionDB(db)
}
