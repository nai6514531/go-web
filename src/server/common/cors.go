package common

import (
	"github.com/iris-contrib/middleware/cors"
)

func SetUpCors() {

	CORS = cors.New(cors.Options{
		AllowedOrigins: []string{"www.soda.com:8080", "www.maizuo.com"},
		AllowedMethods:[]string{"GET","POST","OPTIONS"},
		AllowCredentials:true,
		OptionsPassthrough:true,
		Debug:true,
	})

}

var (
	CORS  *cors.Cors
)
