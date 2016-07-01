#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

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
  -d mongo

docker rm entomo-project-nest

docker run \
  -it \
  -p 3000:3000 \
  -p 3001:3001 \
  -p 3003:3003 \
  --link entomo-project-nest-mongo:mongo \
  -v $DIR/..:/home/r/nest \
  --name entomo-project-nest \
  entomo-project/nest \
  bash
