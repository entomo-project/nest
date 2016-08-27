#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DOCKER_NEST_DATA=`docker inspect --format="{{ .Id }}" entomo-project-nest-data 2> /dev/null`

if [ -z "$DOCKER_NEST_DATA" ]
then
  docker run \
    -d \
    -v /home/r/nest \
    --name entomo-project-nest-data \
    entomo-project/nest \
    bash
fi

$DIR/common-run.sh

docker run \
  -d \
  -p 3000:3000 \
  -p 3001:3001 \
  -p 3003:3003 \
  -p 2222:22 \
  --volumes-from entomo-project-nest-data \
  --net dev \
  --net-alias entomo-project-nest \
  --name entomo-project-nest \
  entomo-project/nest \
  bash -c "service ssh start && chown r:r /home/r/nest && tail -f /dev/null"

DOCKER_MACHINE_IP=`docker-machine inspect --format "{{.Driver.HostOnlyCIDR}}" | sed -E 's#(.*)/24#\1#'`

ID_RSA_PUB=$(cat ~/.ssh/id_rsa.pub)

docker exec -t entomo-project-nest bash -c "mkdir -p /home/r/.ssh"
docker exec -t entomo-project-nest bash -c "echo '$ID_RSA_PUB' > /home/r/.ssh/authorized_keys"

