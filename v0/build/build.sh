#!/bin/bash

SCRIPT_DIR=`dirname $0`
r.js -o $SCRIPT_DIR/build_configuration.js
ant -f $SCRIPT_DIR/minify.xml
