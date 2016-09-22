package common

import (
	"flag"
	"github.com/spf13/viper"
	"log"
)

func SetUpConfig() {
	var (
		conf = flag.String("conf", "", "config file path")
	)

	flag.Parse()

	viper.SetConfigName(*conf)
	viper.AddConfigPath("./")

	err := viper.ReadInConfig()
	if err != nil {
		log.Fatalf("Read config fail:", err.Error())
	}
}
