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


- 手动设置环境
	`
	export NODE_ENV=production
	`

- 更新版本号
	`
	gulp bump:patch || gulp bump:minor
	`

- 编译前端资源
	`
	gulp build
	`

- 编译后端资源
	`
	gulp compile
	`

- 生成Dockerfile
	`
	 gulp docker:config
	`
	
- 构建docker镜像
	`
	 gulp docker:build
	`

- 登录docker远端仓库
	`
	docker login reg.miz.so || docker login reg.maizuo.com
	`

- 推送docker镜像
	`
	gulp docker:push
	`

- 生成kubernetes配置
	`
	gulp k8s:config
	`

- 设置kubernetes环境
	`
	gulp k8s:ctx
	`

- 删除服务器上的服务
	`
	gulp k8s:delete
	`

- 用kubernetes发布(需要先删除原有的rc)
	`
	gulp k8s:create
	`
