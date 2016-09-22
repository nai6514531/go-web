package common

import (
	log "github.com/Sirupsen/logrus"
	"github.com/spf13/viper"
	"os"
)

func SetUpLogger() error {
	isDevelopment := viper.GetBool("isDevelopment")
	logFilePath := viper.GetString("logFilePath")
	logFile, err := os.OpenFile(logFilePath, os.O_RDWR|os.O_APPEND|os.O_CREATE, os.ModePerm)
	if err != nil {
		log.Fatalf("open file error :%s \n", logFilePath)
		TeardownLogger()
	}
	log.SetFormatter(&log.JSONFormatter{})
	if isDevelopment {
		log.SetLevel(log.DebugLevel)
		log.SetOutput(os.Stderr)
	} else {
		log.SetLevel(log.WarnLevel)
		log.SetOutput(logFile)
	}
	Logger = log.WithFields(log.Fields{
		"system": "[h5-smart-cinema]",
		"from":   "15",
		"to":     "26",
	})
	return nil
}

func TeardownLogger() {
	log.Printf("logger file stream closed.")
	logFile.Close()
}

var (
	Logger  *log.Entry
	logFile os.File
)
