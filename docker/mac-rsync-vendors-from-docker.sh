#/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DOCKER_MACHINE_IP=`docker-machine ip`

rsync \
  -avz \
  -e 'ssh -p 2222 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null' \
  --delete-after \
  r@$DOCKER_MACHINE_IP:/home/r/nest/node_modules $DIR/../

rsync \
  -avz \
  -e 'ssh -p 2222 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null' \
  --delete-after \
  r@$DOCKER_MACHINE_IP:/home/r/nest/bower_components $DIR/../