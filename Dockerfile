FROM reg.miz.so/table/busybox:latest
MAINTAINER "Maizuo Table <table@maizuo.com>"

WORKDIR /soda-manager/

RUN rm /etc/localtime && ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

ADD src/build /soda-manager/src/build

ADD soda-manager /soda-manager/

ADD config/prod.yaml /soda-manager/config/prod.yaml

ADD resource /soda-manager/resource

RUN mkdir log

RUN touch log/log.log

CMD ["./soda-manager", "-conf", "config/prod"]
