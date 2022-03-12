#!/usr/bin/env bash

SCRIPT_DIR=$(dirname $0)
VERSION=$1
ROOT_DIR="${SCRIPT_DIR}/.."
BUILD_DIR="${ROOT_DIR}/build"

function usage()
{
    echo "Usage: build.sh <version>"
    echo ""
    echo "Options:"
    echo ""
    echo "    version    Version string to use as images tag (e.g. '20211230.1')"
    echo ""
}

if [[ -z $VERSION ]]; then
  echo "Error: Missing version" >&2
  echo "" >&2
  usage
  exit 1
fi

IMAGE="rezept-db:${VERSION}"

mkdir -p "${BUILD_DIR}"
docker build -t $IMAGE "${ROOT_DIR}"
docker image prune -f
