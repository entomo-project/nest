#/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DOCKER_MACHINE_IP=`docker-machine ip`

ssh \
  -p 2222 \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  -t \
  r@$DOCKER_MACHINE_IP \
  'cd /home/r/nest && bash'