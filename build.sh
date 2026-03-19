#!/bin/bash

if [ "$1" = "Local" ]; then
    export REACT_APP_BASE_URL=http://localhost:8000
    cat endpoints.env > .env
    echo "REACT_APP_BASE_URL=http://localhost:8000" >> .env
    [ -f .env.local ] && cat .env.local >> .env
    npm run start
else
    echo "Usage: $0 {Local}"
    exit 1
fi
