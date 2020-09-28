# buffer
Node.js application buffering writing to ClickHouse using Redis as a buffer

## configuration
To configure the app you can set environment variables

| Environment variable | Default value | Description |
|----------------|:---------:|:----------------------|
| PORT           | 3000      | Http server port |
| CH_HOST        | 127.0.0.1 | ClickHouse host |
| CH_PORT        | 8123      | ClickHouse server port |
| CH_USER        | default   | ClickHouse server user |
| CH_PASSWORD    |           | ClickHouse server password |
| REDIS_HOST     | 127.0.0.1 | Redis host |
| REDIS_PORT     | 6379      | Redis server port |
| REDIS_PASSWORD |           | ClickHouse server password |
| REDIS_PORT     | 6379      | Redis server port |
| MAX_TIME       | 50        | Writing buffer to ClickHouse timeout |
| MAX_BUFFER_SIZE| 50        | Maximum buffer size before immediate writing |
| TABLES         |           | ClickHouse table names separated by ';' (example: foo;bar) |

## setup

- git clone https://github.com/3Tn0/buffer.git
- cd buffer
- npm i
- node index

## using
To write data to the buffer, you need to send an ```http POST``` request to ```http://yourserveraddress:3000/buffer``` with the following body:

```
{
    "table": "staff",
    "values": [
        {
            "name": "Sammy",
            "position": "Frontend developer"
        }
    ]
}
```

where:
 - table: ClickHouse table
 - values: Array of values you want to store
 
 data will be moved to ClickHouse when the timeout ```MAX_TIME``` expires or the buffer size exceeds ```MAX_BUFFER_SIZE```
