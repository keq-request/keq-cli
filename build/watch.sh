#!/bin/bash
NODE_ENV=development

cpx "./src/**/*.{hbs,json,md}" "dist/umd/src" --watch &
cpx "./src/**/*.{hbs,json,md}" "dist/esm/src" --watch &
tsc -p build/tsconfig.umd.json -w &
tsc -p build/tsconfig.esm.json -w
