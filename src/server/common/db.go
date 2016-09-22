package common

import (
	_ "github.com/go-sql-driver/mysql"
	"github.com/jinzhu/gorm"
	"github.com/spf13/viper"
	"log"
	"os"
)

func initLog() *log.Logger {
	isDevelopment := viper.GetBool("isDevelopment")
	if isDevelopment {
		return log.New(os.Stdout, "\r\n", 0)
	} else {
		logFilePath := viper.GetString("logFilePath")
		logFile, err := os.OpenFile(logFilePath, os.O_RDWR|os.O_APPEND|os.O_CREATE, os.ModePerm)
		if err != nil {
			log.Fatalf("open file error :%s \n", logFilePath)
		}
		return log.New(logFile, "[h5-mall-if] ", log.Ldate|log.Ltime|log.Llongfile)
	}
}

func SetUpDB() {

	isDevelopment := viper.GetBool("isDevelopment")
	dialect := viper.GetString("server.db.dialect")
	user := viper.GetString("server.db.user")
	password := viper.GetString("server.db.password")
	database := viper.GetString("server.db.database")
	host := viper.GetString("server.db.host")
	port := viper.GetString("server.db.port")

	url := user + ":" + password + "@tcp(" + host + ":" + port + ")/" + database + "?charset=utf8&parseTime=True&loc=Local"

	db, err := gorm.Open(dialect, url)
	if err != nil {
		panic("failed to connect database")
	}

	db.LogMode(isDevelopment)

	//db.SetLogger(initLog())

	db.DB().SetMaxIdleConns(10)
	db.DB().SetMaxOpenConns(10)

	DB = db

}

var (
	DB *gorm.DB
)
