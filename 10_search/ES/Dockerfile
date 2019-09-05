FROM ubuntu:18.04
LABEL maintainer dokcer_user<sen20181020@358974225@qq.com>
ENV LANG C.UTF-8

RUN apt update
RUN apt install vim -y
RUN echo '{"mainAddress": "192.168.1.2:27018","continueOnError": true,"fields": ["name", "abs", "intro"], "namespaces": {"data.entity":true},"docManagers": [{"docManager": "elastic2_doc_manager","targetURL": "192.168.1.44:9200","uniqueKey": "_id", "autoCommitInterval":60}]}'  >> config
RUN apt install python3 -y \
    && apt install python3-pip -y \
         && pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple 'mongo-connector[elastic5]' && pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple 'elastic2-doc-manager'
CMD mongo-connector -c /root/data/config
