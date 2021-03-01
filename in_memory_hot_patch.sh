#!/bin/bash

echo "Hot patching mongoengine to using inmemory pymongo"

FILE_PATH=venv/lib/python3.9/site-packages/mongoengine/connection.py

if [ ! -f ${FILE_PATH} ]; then
    echo "${FILE_PATH} not found!"
    echo "Please patch mongoengine connection.py"
    exit 1
fi

# hot patch
awk 'NR==3{print "from pymongo_inmemory import MongoClient"}1' ${FILE_PATH} > tmp && mv tmp ${FILE_PATH}

echo "PATCH EXIT CODE: $?"