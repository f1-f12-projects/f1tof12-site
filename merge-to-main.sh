#!/bin/bash

echo "Merging dev to main branch..."

# Switch to main branch
git checkout main

# Pull latest changes from remote main
git pull origin main

# Merge dev branch into main
git merge dev

# Push merged changes to main (triggers deployment)
git push origin main

# Switch back to dev branch
git checkout dev

echo "Merge complete! Deployment will start automatically."
echo "Switched back to dev branch."