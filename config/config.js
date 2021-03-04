/**
 * Configure for all environments here
 */
const _ = require('lodash');
const AWS = require('aws-sdk');

const region = _.get(process.env, 'AWS_REGION', 'ap-southeast-1');
const Name = process.env.AWS_SSM_NAME;
const ssm = new AWS.SSM({
  region,
  apiVersion: '2014-11-06'
});

const params = {
  Name,
  WithDecryption: true
};

var config = {};

function getConfigEnvVariables() {
  return new Promise((resolve, reject) => {
    if (!params.Name) {
      reject(new Error('Could not get AWS_SSM_NAME env'));
    }
    ssm.getParameter(params, (err, data) => {
      if (err) {
        reject(_.get(err, 'stack', 'Load System Parameter Store fail'));
      } else {
        const parameter = JSON.parse(_.get(data.Parameter, 'Value', '{}'));
        _.forEach(parameter, (item, key) => {
          process.env[key] = item;
        });
        resolve(true);
      }
    });
  });
}

async function initAppConfigs() {
  if (process.env.NODE_ENV !== 'development' && params.Name) {
    await getConfigEnvVariables();
  } else {
    const result = require('dotenv').config({
      debug: process.env.ENABLE_LOG_DEBUG &&
        parseInt(process.env.ENABLE_LOG_DEBUG) === 1
    });
    if (result.error) {
      throw result.error;
    }
  }
  const {NODE_ENV, REDIS_URL, API_HOST, API_PORT, API_MAX_SIZE, LOG_LEVEL} = process.env;
  
  config = {
    NODE_ENV: NODE_ENV,
    REDIS_URL: REDIS_URL,
    API_HOST: API_HOST,
    API_PORT: API_PORT,
    API_MAX_SIZE: API_MAX_SIZE,
    LOG_LEVEL: LOG_LEVEL
  };
}

function getConfig() {
  return config;
}

module.exports = {
  initAppConfigs,
  getConfig
};


