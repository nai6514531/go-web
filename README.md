## 苏打生活管理系统

### 目录结构

* src/static 

前端业务逻辑处理 & 页面静态资源

* src/server

后端业务逻辑处理

### 编译和运行

* 安装golang环境

推荐下载地址

[Windows](http://golangtc.com/static/go/1.5.2/go1.5.2.windows-amd64.zip)

[Mac](http://golangtc.com/static/go/1.5.2/go1.5.2.darwin-amd64.tar.gz)

### 配置


```
获取 go依赖
go get 

获取 js依赖
npm i 

```
### 开发环境

```
gulp 

gulp deve || gulp local
```

### 预生产环境(preview)210测试

`待补充`

### 生产环境

`
export NODE_ENV=production
`

1、编译前端js

`
gulp build
`

2、手动打版本号

`
gulp bump:patch || gulp bump:minor
`

3、编译后端go

`
gulp compile
`

4、按环境动态生成Dockerfile(`需切换到docker命令行`)

`
 gulp docker:config
`
5、本地docker镜像构建(`需切换到docker命令行`)

`
 gulp docker:build
`

6、推送docker镜像push到仓库(`需切换到docker命令行`)

`
gulp docker:push
`

7、按环境动态生成kubernetes配置文件

`
gulp k8s:config
`

8、设置kubernetes环境

`
gulp k8s:ctx
`

9、删除服务器上的服务

`
gulp k8s:delete
`

10、用kubernetes发布(需要先删除原有的rc)

`
gulp k8s:create
`
