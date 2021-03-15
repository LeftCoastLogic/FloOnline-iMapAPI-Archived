'use strict';

const pino = require('pino');

const { getConfig } = require('../config/config');
const config = getConfig();

config.log = config.LOG_LEVEL || {
    level: 'trace'
};

let logger = pino();
logger.level = config.LOG_LEVEL;

const { threadId } = require('worker_threads');

if (threadId) {
    logger = logger.child({ tid: threadId });
}

process.on('uncaughtException', err => {
    logger.fatal({
        msg: 'uncaughtException',
        err
    });
    setTimeout(() => process.exit(1), 10);
});

process.on('unhandledRejection', err => {
    logger.fatal({
        msg: 'unhandledRejection',
        err
    });
    setTimeout(() => process.exit(2), 10);
});

module.exports = logger;
