const http = require('http')
const redisService = require('./redisService')
const Watcher = require('./watcher')
const { getInitialQueHandler, TABLES } = require('./handlers')
const logger = require('./logger')

const port = process.env.PORT || 3000
const MAX_BUFFER_SIZE = process.env.MAX_BUFFER_SIZE || 50;

const watcher = new Watcher()

getInitialQueHandler()
    .then(buffersQue => {

        watcher.buffersQue = buffersQue
        watcher.start()

        const server = http.createServer(requestHandler)
        server.listen(port, (err) => {
            if (err) {
                return logger.error('Error starting server', err)
            }
            logger.log(`server is listening on ${port}`)
        })

    })
    .catch(err => {
        logger.error('Error while initiating server', err)
    })

const requestHandler = (request, response) => {
    switch (`${request.method}:${request.url}`) {
        case "POST:/buffer":
            let body = ''

            request.on('data', chunk => {
                body += chunk.toString();
            });
            request.on('end', () => {
                let { table, values } = JSON.parse(body);

                if (!TABLES.includes(table)) {
                    response.writeHead(500);
                    return response.end(JSON.stringify({ message: 'No such table' }));
                }

                redisService.writeToBuffer(table, values)
                    .then(recordsNumber => {
                        response.writeHead(200);
                        response.end('ok');

                        if (recordsNumber >= MAX_BUFFER_SIZE) {
                            watcher.bufferFull(table, recordsNumber)
                        }
                        else {
                            watcher.addToQue(table)
                        }
                    })
                    .catch(err => {
                        logger.log('Error handling writing to buffer', err)
                        response.writeHead(500);
                        response.end(JSON.stringify({ message: err }));
                    })
            });
            break
        default:
            response.writeHead(404);
            response.end(JSON.stringify({ message: "Who are you and what do you want from me? :(" }));
    }

}

