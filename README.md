# API calls and requirements

## Summary

The base path for all API calls is `/api/v1`.

### `/business/add`

Success:

```
curl --location 'localhost:8000/api/v1/business/add' \
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
```

Invalid body:

```
curl --location 'localhost:8000/api/v1/business/add' \
--header 'Content-Type: application/json' \
--data '
{}'
```
### `/business/modify/:id`

Success:
```
curl --location 'localhost:8000/api/v1/business/modify/1' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 1,
    "name": "New Business Name 12",
    "address": "9876 Tree Street"
}'
```

Business Not Found:

```
curl --location 'localhost:8000/api/v1/business/modify/9999' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 1,
    "name": "New Business Name 12",
    "address": "9876 Tree Street"
}'
```
OwnerId not in request body:

```
curl --location 'localhost:8000/api/v1/business/modify/1' \
--header 'Content-Type: application/json' \
--data '{}'
```
OwnerId does not match Business OwnerId:

```
curl --location 'localhost:8000/api/v1/business/modify/1' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 9999,
    "name": "New Business Name 12",
    "address": "9876 Tree Street"
}'
```

### `/business/remove/:id`

Business Not Found:
```
curl --location 'localhost:8000/api/v1/business/remove/9999' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 1
}'
```

OwnerId not in request body:
```
curl --location 'localhost:8000/api/v1/business/remove/1' \
--header 'Content-Type: application/json' \
--data '{}'
```

OwnerId does not match business OwnerId:
```
curl --location 'localhost:8000/api/v1/business/remove/1' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 9999
}'
```

Success:
```
curl --location 'localhost:8000/api/v1/business/remove/1' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 1
}'
```

### `/businesses`

Success:
```
curl --location 'localhost:8000/api/v1/businesses'
```

### `/businesses/:id`

Success:
```
curl --location 'localhost:8000/api/v1/businesses?ownerId=1'
```

### `/business/:id`

Business Not Found:
```
curl --location 'localhost:8000/api/v1/business/0'
```

Success:
```
curl --location 'localhost:8000/api/v1/business/1'
```

### `/review/add`

Success/duplicate review:
```
curl --location 'localhost:8000/api/v1/review/add' \
--header 'Content-Type: application/json' \
--data '{
    "businessId": 1,
    "ownerId": 1,
    "stars": 4,
    "dollars": 3
}'
```

Invalid Request Body:
```
curl --location 'localhost:8000/api/v1/review/add' \
--header 'Content-Type: application/json' \
--data '{}'
```

### `/review/modify/:id`

Invalid Request Body: 
```
curl --location 'localhost:8000/api/v1/review/modify/1' \
--header 'Content-Type: application/json' \
--data '{}'
```

Review Not Found:
```
curl --location 'localhost:8000/api/v1/review/modify/9999' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 1,
    "stars": 4
}'
```

OwnerId does not match review Ownerid
```
curl --location 'localhost:8000/api/v1/review/modify/1' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 9999,
    "stars": 4
}'
```

Invalid Modification
```
curl --location 'localhost:8000/api/v1/review/modify/1' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 1,
    "stars": 10
}'
```

Success
```
curl --location 'localhost:8000/api/v1/review/modify/1' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 1,
    "stars": 3
}'
```

### `/review/remove/:id`

Invalid Request Body: 
```
curl --location 'localhost:8000/api/v1/review/remove/1' \
--header 'Content-Type: application/json' \
--data '{}'
```

Review Not Found:
```
curl --location 'localhost:8000/api/v1/review/remove/9999' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 1
}'
```

OwnerId does not match Review Ownerid
```
curl --location 'localhost:8000/api/v1/review/remove/1' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 9999
}'
```

Success
```
curl --location 'localhost:8000/api/v1/review/remove/1' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 1
}'
```

### `/photo/add`

Invalid Request Body: 
```
curl --location 'localhost:8000/api/v1/photo/add' \
--header 'Content-Type: application/json' \
--data '{}'
```

Success
```
curl --location 'localhost:8000/api/v1/photo/add' \
--header 'Content-Type: application/json' \
--data '{
    "userId": 1,
    "businessId": 1,
    "fileName": "smiley_face.jpg"
}'
```

### `/photo/remove/:id`

Invalid Request Body: 
```
curl --location 'localhost:8000/api/v1/photo/remove/1' \
--header 'Content-Type: application/json' \
--data '{}'
```

Photo Not Found:
```
curl --location 'localhost:8000/api/v1/photo/remove/9999' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 1
}'
```

OwnerId does not match review Ownerid
```
curl --location 'localhost:8000/api/v1/photo/remove/1' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 9999
}'
```

Success
```
curl --location 'localhost:8000/api/v1/photo/remove/1' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 1
}'
```

### `/photo/modify/:id`

Invalid Request Body: 
```
curl --location 'localhost:8000/api/v1/photo/modify/1' \
--header 'Content-Type: application/json' \
--data '{}'
```

Photo Not Found:
```
curl --location 'localhost:8000/api/v1/photo/modify/9999' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 1,
    "caption": "A new caption for this photograph"
}'
```

OwnerId does not match review Ownerid
```
curl --location 'localhost:8000/api/v1/photo/modify/1' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 9999,
    "caption": "A new caption for this photograph"
}'
```

Success
```
curl --location 'localhost:8000/api/v1/photo/modify/1' \
--header 'Content-Type: application/json' \
--data '{
    "ownerId": 1,
    "caption": "A new caption for this photograph"
}'
```

### `/photos/:id`

Invalid Request Body: 
```

```

Review Not Found:
```

```

OwnerId does not match review Ownerid
```

```

Invalid Modification
```

```

Success
```

```


### Docker commands

To build the project's container, run the following command:

```
docker build -t busi-rate .
```

Once the container is built, you can run it with the following command:
```
docker run -d --name busirate-image -p 8000:8000 busi-rate
```