#!/bin/bash

if [ "$1" = "Dev" ]; then
    export REACT_APP_BASE_URL=https://dev-api.f1tof12.com
    export REACT_APP_CLOUDFRONT_SECRET=$(aws ssm get-parameter --name "/f1tof12/dev/cloudfront/secret-value" --with-decryption --query "Parameter.Value" --output text)
    npm run start
elif [ "$1" = "Prod" ]; then
    export REACT_APP_BASE_URL=https://api.f1tof12.com
    export REACT_APP_CLOUDFRONT_SECRET=$(aws ssm get-parameter --name "/f1tof12/cloudfront/secret-value" --with-decryption --query "Parameter.Value" --output text)
    npm run build
elif [ "$1" = "Local" ]; then
    export REACT_APP_BASE_URL=http://localhost:8000
    npm run start
else
    echo "Usage: $0 {Local|Dev|Prod}"
    exit 1
fi