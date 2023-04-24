#!/bin/bash

echo "Add a business - successful"
echo ""
curl -v --location '172.31.47.53:3000/api/v1/business/add' \
--header 'Content-Type: application/json' \
--data-raw '{
    "ownerId": 1,
    "name": "Swimza",
    "address": "1234 Main Street",
    "city": "Redmond",
    "state": "Oregon",
    "zip": 97756,
    "phone": "503-555-1212",
    "category": "Sports",
    "subcategory": "Swim Meets",
    "website": "http://www.swimza.com",
    "email": "paul@swimza.com"
}
'
echo ""

echo "Add a business - invalid body"
echo ""

curl -v --location '172.31.47.53:3000/api/v1/business/add' \
--header 'Content-Type: application/json' \
--data '
{}'

echo ""

echo "Modify an existing business - valid owner, business, and request body"
echo ""

curl --location '172.31.47.53:3000/api/v1/business/modify/1' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 1,
    "name": "New Business Name 12",
    "address": "9876 Tree Street"
}'

echo ""

echo "Modify an existing business - invalid owner"
echo ""

curl --location '172.31.47.53:3000/api/v1/business/modify/1' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 5,
    "name": "New Business Name 12",
    "address": "9876 Tree Street"
}'

echo ""

echo "Modify an existing business - invalid businessId"
echo ""

curl --location '172.31.47.53:3000/api/v1/business/modify/4' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 1,
    "name": "New Business Name 12",
    "address": "9876 Tree Street"
}'

echo ""

echo "Remove a business - success"
echo ""

curl --location '172.31.47.53:3000/api/v1/business/remove/1' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 1
}'

echo ""

echo "Remove a business - invalid request body"
echo ""

curl --location '172.31.47.53:3000/api/v1/business/remove/1' \
--header 'Content-Type: application/json' \
--data '{}'

echo ""

echo "Remove a business - ownerId mismatch"
echo ""

curl --location '172.31.47.53:3000/api/v1/business/remove/1' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 9999
}'

echo ""

echo "Get business details - success"
echo ""

curl --location '172.31.47.53:3000/api/v1/business/1'

echo ""

echo "Get business details - invalid business"
echo ""

curl --location '172.31.47.53:3000/api/v1/business/0'

echo ""

echo "Get all businesses"
echo ""

curl --location '172.31.47.53:3000/api/v1/businesses'