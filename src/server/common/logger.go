package common

import (
	"github.com/Sirupsen/logrus"
	"github.com/spf13/viper"
	"os"
	"github.com/kataras/iris"
	"maizuo.com/soda-manager/src/server/enity"
	"time"
	"strconv"
	"strings"
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
		handle := strings.Split(ctx.GetHandlerName(), "/")
		_interface := handle[1] + ":" + handle[len(handle) - 2] + ":" + handle[len(handle) - 1]

		if result == nil {
			result = &enity.Result{"00", nil, "success"}
		}

		alarmID:="0"
		_status, _ := strconv.Atoi(result.Status[len(result.Status) - 2 : len(result.Status)])
		if _status != 0 {
			_interface += ":error"
			alarmID="1"
		}

		Logger := logrus.WithFields(logrus.Fields{
			"@source":ctx.LocalAddr().String(),
			"@timestamp":time.Now().Format("2006-01-02 15:04:05"),
			"@fields":map[string]interface{}{
				"fromtype":"soda-manager",
				"host":ctx.HostString(),
				"interface":_interface,
				"method":ctx.MethodString(),
				"ip":ctx.RemoteAddr(),
				"query":ctx.URLParams(),
				"param":ctx.Params.String(),
				"body":body,
				"alarmID":alarmID,
				"path":ctx.PathString(),
				"processTime":processTime,
				"result":result,
				"msg":result.Msg,
				"status":result.Status,
				"system":"soda-manager",
				"totype":"soda-manager",
			},
		})
		Logger.Warningln(result.Status)
	}
)

