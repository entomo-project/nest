#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DOCKER_MACHINE_IP=`docker-machine ip`

rsync \
  -avz \
  -e 'ssh -p 2222 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null' \
  --exclude .git \
  --exclude .idea \
  --delete-after \
  $DIR/../ r@$DOCKER_MACHINE_IP:/home/r/nest