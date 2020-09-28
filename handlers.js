const redisService = require('./redisService')
const chService = require('./chService')
const logger = require('./logger')

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
                .catch(err => logger.error('Error removing values from buffer', err))
            return chService.insert(table, result)
        })
        .catch(err => {
            logger.log('Error handling buffer timeout', err)
        })
}

function bufferFullHandler(table, recordsNumber) {
    redisService.read(table, recordsNumber)
        .then(result => {
            redisService.remove(table, recordsNumber)
                .catch(err => logger.error('Error removing values from buffer', err))
            return chService.insert(table, result)
        })
        .catch(err => {
            logger.log('Error handling buffer full', err)
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
        .catch(err => logger.error('Error getting initial que', err))
}

module.exports = {
    bufferTimeoutHandler,
    bufferFullHandler,
    getInitialQueHandler,
    TABLES,
}