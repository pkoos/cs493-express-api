## API calls and requirements

### Summary

The base path for all API calls is `/api/v1`.

* `/business/add`
* `/business/modify/:id`
* `/business/remove/:id`
* `/businesses`
* `/businesses/:id`
* `/business/:id`
* `/review/add`
* `/review/modify/:id`
* `/review/remove/:id`
* `/photo/add`
* `/photo/remove/:id`
* `/photo/modify/:id`
* `/photos/:id`

### Docker commands

To build the project's container, run the following command:

```
docker build -t busi-rate .
```

Once the container is built, you can run it with the following command:
```
docker run -d --name busirate-image -p 8000:8000 busi-rate
```