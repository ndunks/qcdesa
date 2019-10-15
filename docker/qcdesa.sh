#!/bin/sh

echo "QC Desa Docker $@"

nginx -g "daemon off;" &

cd server
node index.js "$@"
