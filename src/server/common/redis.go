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

func SetUpUserRedis() {
	addr := viper.GetString("server.userRedis.addr")
	password := viper.GetString("server.userRedis.password")
	database := viper.GetInt("server.userRedis.database")
	maxActive := viper.GetInt("server.userRedis.maxActive")
	idleTimeout := time.Duration(viper.GetInt("server.userRedis.idleTimeout")) * time.Second

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
		panic("failed to connect user redis:" + err.Error())
	}

	UserRedis = client

}

var (
	Redis *redis.Client
	UserRedis *redis.Client
)
