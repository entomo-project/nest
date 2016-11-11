FROM ubuntu:14.04

RUN \
  apt-get update && \
  apt-get dist-upgrade -y && \
  apt-get install -y \
    wget \
    git \
    openssh-server \
    php5-cli \
    xz-utils

RUN \
  cd /root && \
  wget https://nodejs.org/dist/v6.9.1/node-v6.9.1-linux-x64.tar.xz && \
  tar -xf node-v6.9.1-linux-x64.tar.xz && \
  rm node-v6.9.1-linux-x64.tar.xz && \
  mkdir /opt/node && \
  mv /root/node-v6.9.1-linux-x64 /opt/node/current

RUN \
  /opt/node/current/bin/node /opt/node/current/lib/node_modules/npm install -g pm2

RUN \
  echo PATH="/opt/node/current/bin:$PATH" >> /etc/environment

RUN \
  adduser --disabled-password --gecos '' r && \
  adduser r sudo && \
  echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers && \
  echo PATH="/opt/node/current/bin:\$PATH" >> /root/.bashrc
