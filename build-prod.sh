#!/bin/bash
export REACT_APP_CLOUDFRONT_SECRET=$(aws ssm get-parameter --name "/f1tof12/cloudfront/secret-value" --with-decryption --query "Parameter.Value" --output text)
npm run build