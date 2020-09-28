const { bufferFullHandler, bufferTimeoutHandler } = require('./handlers')

const MAX_TIME = process.env.MAX_TIME || 15000

module.exports = class Watcher {

    constructor() {
        this.buffersQue = []
        this.isRunning = false
    }

    start() {
        if (this.buffersQue.length)
            this.watch()
        else
            this.isRunning = false
    }

    stop() {
        clearTimeout(this.timer)
        this.isRunning = false
    }

    resetTimer() {
        this.stop()
        this.start()
    }

    addToQue(table) {
        if (!this.buffersQue.includes(table))
            this.buffersQue.push(table)
        if (!this.isRunning)
            this.start()
    }

    removeFromQue(table) {
        let index = this.buffersQue.indexOf(table);
        if (index > -1) {
            this.buffersQue.splice(index, 1);
        }
        if (!this.buffersQue.length)
            this.stop()
    }

    bufferFull(table, recordsNumber) {
        this.removeFromQue(table)
        bufferFullHandler(table, recordsNumber)
    }

    watch() {
        this.isRunning = true
        this.timer = setTimeout(() => {
            if (this.buffersQue.length) {
                let table = this.buffersQue.shift()
                bufferTimeoutHandler(table)
                this.start()
            }
        }, MAX_TIME)
    }

}