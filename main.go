package main

import (
	"maizuo.com/soda-manager/src/server"
	"maizuo.com/soda-manager/src/server/common"
)

func main() {

	common.SetUpConfig()

	common.SetUpLogger()

	common.SetUpSession()

	common.SetUpDB()

	common.SetUpMNDB()

	common.SetUpRedis()

	//common.SetUpRateLimiter()

	//common.SetUpCors()

	//common.SetUpSecure()

	common.SetUpCommon()

	server.SetUpServer()

}
