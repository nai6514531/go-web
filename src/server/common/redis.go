package common

import (
	"github.com/spf13/viper"
	"gopkg.in/redis.v4"
	"time"
)

func SetUpRedis() {

	addr := viper.GetString("server.redis.addr")
	password := viper.GetString("server.redis.password")
	database := viper.GetInt("server.redis.database")
	maxActive := viper.GetInt("server.redis.maxActive")
	idleTimeout := time.Duration(viper.GetInt("server.redis.idleTimeout")) * time.Second

	client := redis.NewClient(&redis.Options{
		Addr:        addr,
		Password:    password,
		DB:          database,
		MaxRetries:  3,
		IdleTimeout: idleTimeout,
		PoolSize:    maxActive,
	})

	_, err := client.Ping().Result()
	if err != nil {
		panic("failed to connect redis:" + err.Error())
	}

	Redis = client

}

var (
	Redis *redis.Client
)
