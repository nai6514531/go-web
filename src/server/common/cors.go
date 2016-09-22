package common

import (
	"github.com/iris-contrib/middleware/cors"
	"github.com/kataras/iris"
)

func SetUpCors() {

	crs := cors.New(cors.Options{
		AllowedOrigins: []string{"www.xxx.com"},
	})

	iris.Use(crs)
}
