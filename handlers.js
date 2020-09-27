const redisService = require('./redisService')
const chService = require('./chService')

const TABLES = process.env.TABLES ? process.env.TABLES.split(';') : []

function bufferTimeoutHandler(table) {
    let recordsNumber
    redisService.getLength(table)
        .then(resultRecordsNumber => {
            recordsNumber = resultRecordsNumber
            return redisService.read(table, resultRecordsNumber)
        })
        .then(result => {
            redisService.remove(table, recordsNumber)
                .catch(console.log)
            return chService.insert(table, result)
        })
        .catch(err => {
            console.log('error in redis read/remove or ch insert')
            console.log(err)
        })
}

function bufferFullHandler(table, recordsNumber) {
    redisService.read(table, recordsNumber)
        .then(result => {
            redisService.remove(table, recordsNumber)
                .catch(console.log)
            return chService.insert(table, result)
        })
        .catch(err => {
            console.log('error in redis read/remove or ch insert')
        })
}

function getInitialQueHandler() {
    const tablesCopy = TABLES.slice();

    return Promise.all(tablesCopy.map(table => {
        return redisService.getLength(table)
    }))
        .then(lengths => {
            return tablesCopy.filter((_, index) => lengths[index])
        })
        .catch(console.log)
}

module.exports = {
    bufferTimeoutHandler,
    bufferFullHandler,
    getInitialQueHandler,
    TABLES,
}