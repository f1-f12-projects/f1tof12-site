#!/bin/bash

# Create IAM user group
aws iam create-group --group-name f1tof12-developers

# Create IAM policy
aws iam create-policy \
  --policy-name f1tof12-developer-policy \
  --policy-document file://aws-iam-policy.json

# Get the policy ARN (replace ACCOUNT_ID with your AWS account ID)
POLICY_ARN="arn:aws:iam::209479277375:policy/f1tof12-developer-policy"

# Attach policy to group
aws iam attach-group-policy \
  --group-name f1tof12-developers \
  --policy-arn $POLICY_ARN

# Create a user and add to group (optional)
# aws iam create-user --user-name developer-user
# aws iam add-user-to-group --user-name developer-user --group-name f1tof12-developers

echo "User group 'f1tof12-developers' created successfully!"
echo "To add users to this group, run:"
echo "aws iam add-user-to-group --user-name USERNAME --group-name f1tof12-developers"