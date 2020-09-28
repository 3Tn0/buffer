const request = require('request');
const logger = require('./logger')

function ClickHouse({ url, port, user, password }) {
    this.url = url;
    this.port = port;
    this.user = user;
    this.password = password;

    this.query = function (queryString) {
        return new Promise((resolve, reject) => {
            request.post({
                url: this.url + ':' + this.port,
                qs: { user: this.user, password: this.password, query: queryString }
            },
                function (err, httpResponse, body) {
                    if (httpResponse.statusCode === 200) {
                        resolve('ok')
                    }
                    reject(body)
                });
        })
    }
}

const ch = new ClickHouse({
    url: 'http://' + (process.env.CH_HOST || '127.0.0.1'),
    port: Number(process.env.CH_PORT) || 8123,
    user: process.env.CH_USER || 'default',
    password: process.env.CH_PASSWORD || ''
})

ch.query(`SELECT *`)
    .catch(result => logger.error("Connection to ClickHouse failed"))

function insert(table, values) {
    let data = values.join(' ')

    return ch.query(`INSERT INTO ${table} FORMAT JSONEachRow ${data}`)
}

module.exports = {
    insert,
}