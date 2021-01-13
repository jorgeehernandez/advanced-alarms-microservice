const _ = require('lodash')
/**
 * Get all the pages of a certain object
 * @param {object} param 
 * @param {Promise} param.promise the initial request
 * @param {Function} param.instance the http request instance
 * @param {string} param.key the key where the data you are searching is
 */
function getAll({ promise, instance, key }) {
    let things = []
    return new Promise(async resolve => {

        const getNext = async request => {
            const { data } = await request
            const { next } = data

            const thing = _.get(data, key)
            things = [...things, ...thing]

            if (thing.length == 2000)
                getNext(instance.get(next))
            else {
                resolve(things)
            }
        }

        getNext(promise)
    })
}

module.exports = getAll
