#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

docker rm entomo-project-nest

docker run \
  -it \
  -p 3000:3000 \
  -p 3001:3001 \
  --link sample-cat-mongo:mongo \
  -v $DIR/..:/home/r/nest \
  --name entomo-project-nest \
  entomo-project/nest \
  bash
