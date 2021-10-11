'use strict';
const { ObjectId } = require('mongodb'); // or ObjectID

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async findHealth (ctx) {
    const { user_id } = ctx.request.query
    if (!user_id) return
    // `ObjectId` can throw https://github.com/mongodb/js-bson/blob/0.5/lib/bson/objectid.js#L22-L51, it's better anyway to sanitize the string first
    if (!ObjectId.isValid(user_id)) {
      return Promise.reject(new TypeError(`Invalid id: ${user_id}`));
    }
    
    try {
      const value = await strapi.query('health-data').model.findOne({
        user_id: ObjectId(user_id)
      })

      return value
    } catch (err) {
      console.error(err.message)
      ctx.response.status = 400
      ctx.response.message = 'last value find failed'
    }
  } 
};
