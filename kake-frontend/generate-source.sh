#!/bin/bash

base=./

defaultController='site'
defaultAction='index'

echo -e "\n\033[1;34mBegin generate source.\033[0;0m\n"

read -p "The controller [${defaultController}] : " controller
read -p "The action [${defaultAction}] : " action

controller=${controller:=${defaultController}}
action=${action:=${defaultAction}}

if [ ! -d ${base}img/${controller} ]
    then
    sudo mkdir -m 0777 -p ${base}img/${controller}
fi

lessFile=${base}less/${controller}/${action}.less
jsFile=${base}js/${controller}/${action}.js

for item in ${lessFile} ${jsFile}
do
    directory=`dirname ${item}`
    if [ ! -d ${directory} ]
        then
        sudo mkdir -m 0777 -p ${directory}
    fi

    if [ ! -f ${item} ]
        then
        sudo touch ${item}
        sudo chmod 0777 ${item}
    fi
done

echo -e "\n\033[1;32mGenerate success.\033[0;0m\n"

# -- eof --