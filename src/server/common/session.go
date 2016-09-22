package common

import (
	"github.com/iris-contrib/sessiondb/redis"
	"github.com/iris-contrib/sessiondb/redis/service"
	"github.com/kataras/iris"
	"github.com/spf13/viper"
	"time"
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
		MaxIdle:       viper.GetInt("server.session.redis.max-idle"),
		MaxActive:     viper.GetInt("server.session.redis.max-active"),
		IdleTimeout:   time.Duration(viper.GetInt("server.session.redis.idle-timeout")) * time.Second,
		Prefix:        viper.GetString("server.session.redis.prefix"),
		MaxAgeSeconds: viper.GetInt("server.session.redis.max-age-seconds"),
	})

	iris.UseSessionDB(db)
}
