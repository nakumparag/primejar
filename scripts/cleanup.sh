#!/bin/bash
# script to cleanup firestore collections
# Usage: ./scripts/cleanup.sh
if ! command -v firebase &> /dev/null
then
    npx firebase firestore:delete --all-collections --project primejar-be836 -y
else
    firebase firestore:delete --all-collections --project primejar-be836 -y
fi
echo "Firestore wiped successfully!"
echo "To wipe Auth Users, please go to https://console.firebase.google.com/project/primejar-be836/authentication/users and delete them."
