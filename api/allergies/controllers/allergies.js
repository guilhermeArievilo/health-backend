'use strict';
const { ObjectId } = require('mongodb'); // or ObjectID

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find (ctx) {
    const { health_id, limit } = ctx.request.query
    if (!health_id) return
    // `ObjectId` can throw https://github.com/mongodb/js-bson/blob/0.5/lib/bson/objectid.js#L22-L51, it's better anyway to sanitize the string first
    if (!ObjectId.isValid(health_id)) {
      return Promise.reject(new TypeError(`Invalid id: ${health_id}`));
    }
    
    try {
      const value = await strapi.query('allergies').model.find({
        published_at: {
          $ne: null
        },
        health_id: ObjectId(health_id)
      })
        .limit(Number(limit))

      return value
    } catch (err) {
      console.error(err.message)
      ctx.response.status = 400
      ctx.response.message = 'find allergies failed'
    }
  },

  async update (ctx) {
    const { health_id, fields } = ctx.request.body
    try {
      const contact = await strapi.query('allergies').model.findOneAndUpdate({
        health_id: ObjectId(health_id),
        _id: ObjectId(fields._id)
      }, fields, {
        new: true
      })

      if (!contact) {
        ctx.response.status = 400
        ctx.response.message = 'allergy not found'
        return
      }

      return contact
    } catch (err) {
      console.error(err.message)
      ctx.response.status = 400
      ctx.response.message = 'Update failed'
    }
  },
};
