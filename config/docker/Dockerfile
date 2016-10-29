FROM reg.miz.so/table/busybox:latest
MAINTAINER "Maizuo Table <table@maizuo.com>"

WORKDIR /<%-config.get('name')%>/

RUN rm /etc/localtime && ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

ADD src/build /<%-config.get('name')%>/src/build

ADD <%-config.get('name')%> /<%-config.get('name')%>/

ADD config/server/<%-env%>.json /soda-manager/config/server/<%-env%>.json

ADD resource /<%-config.get('name')%>/resource

RUN mkdir -p <%-config.get('log.path')%>

CMD ["./<%-config.get('name')%>", "-conf", "config/server/<%-env%>"]
