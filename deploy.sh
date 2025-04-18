#!/bin/bash

echo "🚀 Deploying Ski Patrol to GitHub Pages..."

# Check if you're on the main branch
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
  echo "⚠️  You are on '$BRANCH'. Switch to 'main' to deploy."
  exit 1
fi

# Stage and commit changes
git add .
echo "Enter commit message:"
read COMMIT_MSG
git commit -m "$COMMIT_MSG"

# Push to GitHub
git push origin main

echo "✅ Deployed! Check your site in a few seconds:"
echo "🌐 https://$(git remote get-url origin | sed -E 's/.*github.com[/:](.*)\.git/\1/' | sed 's/^/https:\/\/github.io\//')"