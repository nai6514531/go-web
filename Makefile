GO = godep go
ENTRY = main.go
RUNTIME_CONFIG_FILE = ./runtime.config
BINARY_NAME = ./binary

VERSION = $(shell git describe --tags)

ENV = VERSION=${VERSION}


# config
config:
	@node -e "console.log(JSON.stringify(require('config'), null, 2))" > ${RUNTIME_CONFIG_FILE}.json


# compile
static:
	@${ENV} gulp build

binary: config
	@${ENV} CGO_ENABLED=0 GOOS=linux GOARCH=amd64 ${GO} build -o ${BINARY_NAME}

package: static binary


# server
development: config
	@${ENV} ${GO} run ${ENTRY} -conf ${RUNTIME_CONFIG_FILE}
server:
	@${ENV} ${BINARY_NAME} -conf ${RUNTIME_CONFIG_FILE}


# alias
dev: development


.PHONY: config static binary package development server dev
