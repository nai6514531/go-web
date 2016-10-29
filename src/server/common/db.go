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
		return log.New(logFile, "[soda-manager] ", log.Ldate|log.Ltime|log.Llongfile)
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
	maxIdle := viper.GetInt("server.db.maxIdle")
	maxOpen := viper.GetInt("server.db.maxOpen")

	url := user + ":" + password + "@tcp(" + host + ":" + port + ")/" + database + "?charset=utf8&parseTime=True&loc=Local"

	db, err := gorm.Open(dialect, url)
	if err != nil {
		panic("failed to connect database")
	}

	db.LogMode(isDevelopment)

	db.DB().SetMaxIdleConns(maxIdle)
	db.DB().SetMaxOpenConns(maxOpen)

	DB = db

}

func SetUpMNDB() {

	isDevelopment := viper.GetBool("isDevelopment")
	dialect := viper.GetString("server.mndb.dialect")
	user := viper.GetString("server.mndb.user")
	password := viper.GetString("server.mndb.password")
	database := viper.GetString("server.mndb.database")
	host := viper.GetString("server.mndb.host")
	port := viper.GetString("server.mndb.port")
	maxIdle := viper.GetInt("server.mndb.maxIdle")
	maxOpen := viper.GetInt("server.mndb.maxOpen")

	url := user + ":" + password + "@tcp(" + host + ":" + port + ")/" + database + "?charset=utf8&parseTime=True&loc=Local"

	db, err := gorm.Open(dialect, url)
	if err != nil {
		panic("failed to connect database")
	}

	db.LogMode(isDevelopment)

	db.DB().SetMaxIdleConns(maxIdle)
	db.DB().SetMaxOpenConns(maxOpen)

	MNDB = db

}

func SetUpMNDBPROD() {

	isDevelopment := viper.GetBool("isDevelopment")
	dialect := viper.GetString("server.mndbprod.dialect")
	user := viper.GetString("server.mndbprod.user")
	password := viper.GetString("server.mndbprod.password")
	database := viper.GetString("server.mndbprod.database")
	host := viper.GetString("server.mndbprod.host")
	port := viper.GetString("server.mndbprod.port")
	maxIdle := viper.GetInt("server.mndbprod.maxIdle")
	maxOpen := viper.GetInt("server.mndbprod.maxOpen")

	url := user + ":" + password + "@tcp(" + host + ":" + port + ")/" + database + "?charset=utf8&parseTime=True&loc=Local"

	db, err := gorm.Open(dialect, url)
	if err != nil {
		panic("failed to connect database")
	}

	db.LogMode(isDevelopment)

	db.DB().SetMaxIdleConns(maxIdle)
	db.DB().SetMaxOpenConns(maxOpen)

	MNDBPROD = db

}

var (
	DB   *gorm.DB
	MNDB *gorm.DB
	MNDBPROD *gorm.DB
)
