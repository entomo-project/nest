#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

$DIR/common-run.sh

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
