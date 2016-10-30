package common

import (
	"github.com/Sirupsen/logrus"
	"github.com/spf13/viper"
	"os"
	"github.com/kataras/iris"
	"maizuo.com/soda-manager/src/server/enity"
	"time"
)

func SetUpLogger() {
	isDevelopment := viper.GetBool("isDevelopment")
	if isDevelopment {
		logrus.SetLevel(logrus.DebugLevel)
		logrus.SetOutput(os.Stderr)
		logrus.SetFormatter(&logrus.TextFormatter{})
	} else {
		logFilePath := viper.GetString("logFilePath")
		logFile, err := os.OpenFile(logFilePath, os.O_RDWR | os.O_APPEND | os.O_CREATE, os.ModePerm)
		if err != nil {
			logrus.Fatalf("open file error :%s \n", logFilePath)
			TeardownLogger()
		}
		logrus.SetLevel(logrus.WarnLevel)
		logrus.SetOutput(logFile)
		logrus.SetFormatter(&logrus.JSONFormatter{})
	}
	Logger = logrus.WithFields(logrus.Fields{})
}

func TeardownLogger() {
	logrus.Printf("logger file stream closed.")
	logFile.Close()
}

var (
	Logger  *logrus.Entry
	logFile *os.File
	Log = func(ctx *iris.Context, result *enity.Result) {
		startAt := ctx.Get("startAt").(int64)
		endAt := time.Now().UnixNano() / 1000000
		processTime := endAt - startAt
		body := string(ctx.PostBody()[:])
		Logger := logrus.WithFields(logrus.Fields{
			"@source":ctx.RemoteAddr(),
			"@timestamp":time.Now().Format("2006-01-02 15:04:05"),
			"@fields":map[string]interface{}{
				"fromtype":"soda-manager",
				"host":ctx.HostString(),
				"interface":ctx.PathString(),
				"method":ctx.MethodString(),
				"ip":ctx.LocalAddr().String(),
				"query":ctx.URLParams(),
				"param":ctx.Params.String(),
				"body":body,
				"path":ctx.PathString(),
				"processTime":processTime,
				"result":result,
				"errorMsg":result.Msg,
				"errorStatus":result.Status,
				"system":"soda-manager",
				"totype":"soda-manager",
			},
		})
		Logger.Warningln(result.Status)
	}
)

