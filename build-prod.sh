#!/bin/bash
export REACT_APP_CLOUDFRONT_SECRET=$(aws ssm get-parameter --name "/app/cloudfront-secret" --with-decryption --query "Parameter.Value" --output text)
npm run build