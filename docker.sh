#!/bin/bash

NPM_OPTS="--unsafe-perm"

function show_help() {
  echo "$0 build"
  echo "$0 install"
  echo "$0 run dev"
  echo "$0 run build"
  echo "$0 audit-fix"
  echo "$0 ci"
}

if [ $# -lt 1 ]; then
  show_help
  exit 0
fi

set -e

cd "`dirname $0`"

if [ -z "$DOCKER_IT" ] && [ "${DOCKER_IT:-A}" = "${DOCKER_IT-A}" ]; then
  DOCKER_IT="-it"
fi

DOCKER_RM=${DOCKER_RM---rm}

case "$1" in
  "build" ) docker build -t kunai:0.0.0-alpine docker ;;
  "install" ) docker run $DOCKER_RM -v `pwd`:/var/src $DOCKER_IT kunai:0.0.0-alpine npm install $NPM_OPTS ;;
  "dist" ) docker run $DOCKER_RM -v `pwd`:/var/src $DOCKER_IT kunai:0.0.0-alpine npm run build ;;
  "audit-fix" ) docker run $DOCKER_RM -v `pwd`:/var/src $DOCKER_IT kunai:0.0.0-alpine npm audit fix ;;
  "run" )
    if [ $# -lt 2 ]; then
      show_help
      exit 1
    fi
    docker run $DOCKER_RM -v `pwd`:/var/src -p 8080:8080 $DOCKER_IT kunai:0.0.0-alpine npm run $2 ;;
  "ci" ) docker run $DOCKER_RM -v `pwd`:/var/src $DOCKER_IT kunai:0.0.0-alpine npm ci ;;
  * )
    show_help
    exit 1 ;;
esac
