#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

docker network create dev

DOCKER_MONGO=`docker inspect --format="{{ .Id }}" entomo-project-nest-mongo 2> /dev/null`
DOCKER_MONGO_DATA=`docker inspect --format="{{ .Id }}" entomo-project-nest-mongo-data 2> /dev/null`

if [ -z "$DOCKER_MONGO_DATA" ]
then
  docker run \
    -d \
    -v /data/db \
    --name entomo-project-nest-mongo-data \
    mongo \
    bash
fi

if ! [ -z "$DOCKER_MONGO" ]
then
  echo 'Kill and remove mongo container.'

  docker kill $DOCKER_MONGO
  docker rm $DOCKER_MONGO
fi

docker run \
  --volumes-from entomo-project-nest-mongo-data \
  --name entomo-project-nest-mongo \
  -p 27017:27017 \
  --net dev \
  --net-alias entomo-project-nest-mongo \
  -d mongo

docker kill entomo-project-nest
docker rm entomo-project-nest