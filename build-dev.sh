#!/bin/bash
export REACT_APP_CLOUDFRONT_SECRET=$(aws ssm get-parameter --name "/f1tof12/dev/cloudfront/secret-value" --with-decryption --query "Parameter.Value" --output text)
export REACT_APP_BASE_URL=https://dev-api.f1tof12.com
mv .env.local .env.local.bak 2>/dev/null || true
(echo "REACT_APP_BASE_URL=$REACT_APP_BASE_URL"; echo "REACT_APP_CLOUDFRONT_SECRET=$REACT_APP_CLOUDFRONT_SECRET"; echo; cat production.env) > .env
npm run build
mv .env.local.bak .env.local 2>/dev/null || true