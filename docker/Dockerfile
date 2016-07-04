FROM ubuntu:14.04

RUN \
  apt-get update && \
  apt-get install -y \
    wget

RUN \
  adduser --disabled-password --gecos '' r && \
  adduser r sudo && \
  echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

RUN \
  apt-get install xz-utils

WORKDIR /root
RUN wget https://nodejs.org/dist/v4.4.6/node-v4.4.6-linux-x64.tar.xz
RUN tar -xf node-v4.4.6-linux-x64.tar.xz
RUN rm node-v4.4.6-linux-x64.tar.xz

RUN mkdir /opt/node
RUN mv /root/node-v4.4.6-linux-x64 /opt/node/current

RUN echo PATH="/opt/node/current/bin:\$PATH" >> /root/.bashrc
RUN echo PATH="/opt/node/current/bin:\$PATH" >> /home/r/.bashrc

ENV HOME /root

COPY entrypoint.sh /entrypoint.sh
RUN chmod u+x /entrypoint.sh

RUN echo "cd /home/r/nest" >> /home/r/.bashrc

RUN /opt/node/current/bin/npm install nodemon -g

RUN \
  apt-get install -y \
    git

ENTRYPOINT /entrypoint.sh
