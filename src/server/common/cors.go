package common

import (
	"gopkg.in/iris-contrib/middleware.v4/cors"
	"github.com/spf13/viper"
)

func SetupCORS() {

	isDevelopment := viper.GetBool("isDevelopment")
	allowedOrigins := viper.GetStringSlice("server.cors.allowedOrigins")
	allowedHeaders := viper.GetStringSlice("server.cors.allowedHeaders")
	allowedMethods := viper.GetStringSlice("server.cors.allowedMethods")
	maxAge := viper.GetInt("server.cors.maxAge")
	CORS = cors.New(cors.Options{
		MaxAge:             maxAge,
		AllowedOrigins:     allowedOrigins,
		AllowedMethods:     allowedMethods,
		AllowCredentials:   true,
		OptionsPassthrough: false,
		AllowedHeaders:     allowedHeaders,
		Debug:              isDevelopment,
	})

}

var (
	CORS  *cors.Cors
)
