#!/bin/bash
cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null

NODE=node
if [ -e ./bin/node ]; then
    NODE="$PWD/bin/node"
fi

if ! "$NODE" -v &>/dev/null; then
    echo "NodeJS not found, please install it." 
    read -n 1 
    exit 1
fi

# Overwrite passcode by passing arguments, (the last is used) ./qcdesa.sh --passcode 1234
exec "$NODE" ./js/qcdesa.js --self "$0" --passcode admin --listen 8080 "$@"
