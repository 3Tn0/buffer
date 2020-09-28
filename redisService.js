const redis = require("redis")
const logger = require("./logger")

const client = redis.createClient({
    host: process.env.REDIS_HOST || '46.101.228.167',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || 'redispass',
});

client.on("error", function (error) {
    logger.error("Connection to Redis failed", error)
});

function writeToBuffer(table, values) {
    return new Promise((resolve, reject) => {
        let stringValues = values.map(JSON.stringify)

        client.rpush(table, ...stringValues, function (err, reply) {
            if (err)
                reject(err)
            resolve(reply)
        })
    })
}

function read(table, recordsNumber) {
    return new Promise((resolve, reject) => {

        client.lrange(table, 0, recordsNumber, function (err, reply) {
            if (err)
                reject(err)
            resolve(reply)
        })

    })
}


function remove(table, recordsNumber) {
    return new Promise((resolve, reject) => {
        client.ltrim(table, recordsNumber, -1, function (err, reply) {

            if (err)
                reject(err)
            resolve(reply)
        })
    })
}

function tables() {
    return new Promise((resolve, reject) => {
        client.keys('*', function (err, reply) {

            if (err)
                reject(err)
            resolve(reply.filter((item) => !item.startsWith('backup')))
        })
    })
}

function getLength(table) {
    return new Promise((resolve, reject) => {
        client.llen(table, function (err, reply) {
            if (err)
                reject(err)

            resolve(reply)
        })
    })
}

module.exports = {
    writeToBuffer,
    read,
    remove,
    tables,
    getLength,
}




