package main

import (
	"maizuo.com/smart-cinema/src/server"
	"maizuo.com/smart-cinema/src/server/common"
)

func main() {

	common.SetUpConfig()

	common.SetUpLogger()

	common.SetUpSession()

	common.SetUpDB()

	common.SetUpRedis()

	//common.SetUpRateLimiter()

	//common.SetUpCors()

	//common.SetUpSecure()

	server.SetUpServer()

}
