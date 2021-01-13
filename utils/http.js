const axios = require('axios')

/**
 * Create an http client with the baseURL already setted up
 * @param {string} credentials 
 */
function http (credentials) {
  const baseURL = process.env.C8Y_BASEURL ? process.env.C8Y_BASEURL : 'https://tracking.bismark-iot.com'

  if (!credentials) return
  return axios.create({
    baseURL,
    headers: {
      Authorization: credentials
    }
  })
}

module.exports = http

