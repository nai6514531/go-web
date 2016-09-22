package common

import (
	"github.com/spf13/viper"
	"time"
	"fmt"
	"gopkg.in/redis.v4"
)

func SetUpRedis() {

	addr := viper.GetString("server.redis.addr")
	password := viper.GetString("server.redis.password")
	database := viper.GetInt("server.redis.database")
	//maxIdle := viper.GetInt("server.redis.maxidle")
	maxActive := viper.GetInt("server.redis.maxactive")
	idleTimeout := time.Duration(viper.GetInt("server.redis.idletimeout")) * time.Second

	client := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password, // no password set
		DB:       database, // use default DB
		MaxRetries:3,
		IdleTimeout:idleTimeout,
		PoolSize:maxActive,
	})

	pong, err := client.Ping().Result()
	fmt.Println(pong, err)

	/*pool := &redis.Pool{
		MaxIdle:     maxIdle,
		MaxActive:   maxActive,
		IdleTimeout: idleTimeout,
		Dial: func() (redis.Conn, error) {
			c, err := redis.Dial("tcp", addr)
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
		},
		TestOnBorrow: func(c redis.Conn, t time.Time) error {
			if time.Since(t) < time.Minute {
				return nil
			}
			_, err := c.Do("PING")
			return err
		},
	}

	Redis = pool.Get()*/

	Redis = client

}

var (
	Redis *redis.Client
)
