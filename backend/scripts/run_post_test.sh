#!/bin/sh

set -e

RESP=$(curl -s -X POST http://localhost/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"password"}')
echo "LOGIN_RESPONSE:$RESP"
TOKEN=$(echo "$RESP" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
if [ -z "$TOKEN" ]; then
  echo "Failed to get token"
  exit 1
fi

echo "TOKEN:$TOKEN"

POST_RESP=$(curl -s -X POST http://localhost/api/journal-entries/1/post -H "Authorization: Bearer $TOKEN" -H "X-Company-Id: 1")

echo "POST_RESPONSE:$POST_RESP"
