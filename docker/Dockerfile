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
  wget https://nodejs.org/dist/v4.4.6/node-v4.4.6-linux-x64.tar.xz && \
  tar -xf node-v4.4.6-linux-x64.tar.xz && \
  rm node-v4.4.6-linux-x64.tar.xz && \
  mkdir /opt/node && \
  mv /root/node-v4.4.6-linux-x64 /opt/node/current

RUN \
  adduser --disabled-password --gecos '' r && \
  adduser r sudo && \
  echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers && \
  echo PATH="/opt/node/current/bin:\$PATH" >> /root/.bashrc && \
  echo PATH="/opt/node/current/bin:\$PATH" >> /home/r/.bashrc
