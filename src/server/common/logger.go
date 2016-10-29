package common

import (
	log "github.com/Sirupsen/logrus"
	"github.com/spf13/viper"
	"os"
)

func SetUpLogger() {
	isDevelopment := viper.GetBool("isDevelopment")
	if isDevelopment {
		log.SetLevel(log.WarnLevel)
		log.SetOutput(os.Stderr)
		log.SetFormatter(&log.TextFormatter{})
		Logger = log.WithFields(log.Fields{})
	} else {
		logFilePath := viper.GetString("logFilePath")
		logFile, err := os.OpenFile(logFilePath, os.O_RDWR | os.O_APPEND | os.O_CREATE, os.ModePerm)
		if err != nil {
			log.Fatalf("open file error :%s \n", logFilePath)
			TeardownLogger()
		}
		log.SetLevel(log.WarnLevel)
		log.SetOutput(logFile)
		log.SetFormatter(&log.JSONFormatter{})
		Logger = log.WithFields(log.Fields{
			"@source":"192.168.1.43",
			"@fields":map[string]interface{}{
				"fromtype":"soda-manager",
				"host":"mng.huacetech.cn",
				"interface":"/api/billboard/home_error",
				"ip":"127.0.0.1",
				"query":"{\"__t\":[\"1477386192318\"],\"count\":[\"5\"]}",
				"path":"/api/billboard/home",
				"processTime":"1009.9494ms",
				"result":"{\"status\":4500001,\"data\":null,\"msg\":\"系统错误\"}",
				"errorMsg":"系统错误",
				"errorStatus":"4.500001E+06",
				"system":"soda-manager",
				"totype":"soda-manager",
			},
			"@timestamp":"2016-10-25 17:03:12.3330174 +0800 CST",
		})
	}
}

func TeardownLogger() {
	log.Printf("logger file stream closed.")
	logFile.Close()
}

var (
	Logger  *log.Entry
	logFile os.File
)
