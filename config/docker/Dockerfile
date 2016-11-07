FROM reg.miz.so/soda/centos:latest
MAINTAINER "Maizuo Table <table@maizuo.com>"

WORKDIR /<%-config.get('name')%>/

ADD src/build /<%-config.get('name')%>/src/build

ADD <%-config.get('name')%> /<%-config.get('name')%>/

ADD config/<%-env%>.json /soda-manager/config/<%-env%>.json

ADD resource /<%-config.get('name')%>/resource

RUN mkdir -p <%-config.get('log.path')%>

CMD ["./<%-config.get('name')%>", "-conf", "config/<%-env%>"]
