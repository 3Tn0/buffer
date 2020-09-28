function getDate() {
    return (new Date()).toString().split(' ').splice(1, 4).join(' ');
}

function log(message) {
    console.log(getDate() + '\t', message + '\n\n')
}

function error(message, err = '') {
    console.log(getDate() + '\t', message + '\n', err + '\n\n')
}

module.exports = {
    log,
    error,
}