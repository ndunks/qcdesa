#!/bin/bash
# Portable packer
cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null
VER=$(grep '"version"' ../package.json  | cut -d '"' -f4)
NAME="qcdesa-$VER"

# All OS without NODE
OS_ALL="$PWD/dist/$NAME.zip"

[ -d dist ] || mkdir dist
rm -rf dist/*

if [ ! -d ../dist ]; then
    yarn --cwd "../" build
fi

zip -ur9 "$OS_ALL" "js" "node_modules" "package.json"
pushd ../dist
zip -Dr9 "$OS_ALL" *
popd

# OS depend
for OS in os/*/; do
    if [ ! -e "$OS/bin/node"* ]; then
        echo "NodeJS binary not found in $OS"
        exit 1
    fi
    OS_ZIP="$PWD/dist/$NAME-$( basename $OS).zip"
    cp "$OS_ALL" "$OS_ZIP";
    pushd $OS
    zip -ur9 "$OS_ZIP" *
    echo $OS;
    popd
done

# All OS Script
pushd os/linux-x64/
zip -9 "$OS_ALL" qcdesa.sh
popd && pushd os/win-x64/
zip -9 "$OS_ALL" qcdesa.cmd
popd

