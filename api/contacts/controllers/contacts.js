'use strict';
const { ObjectId } = require('mongodb'); // or ObjectID

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find (ctx) {
    const { user_id, limit } = ctx.request.query
    if (!user_id) return
    // `ObjectId` can throw https://github.com/mongodb/js-bson/blob/0.5/lib/bson/objectid.js#L22-L51, it's better anyway to sanitize the string first
    if (!ObjectId.isValid(user_id)) {
      return Promise.reject(new TypeError(`Invalid id: ${user_id}`));
    }
    
    try {
      const value = await strapi.query('contacts').model.find({
        published_at: {
          $ne: null
        },
        user_id: ObjectId(user_id)
      })
        .limit(Number(limit))

      return value
    } catch (err) {
      console.error(err.message)
      ctx.response.status = 400
      ctx.response.message = 'find contacts failed'
    }
  },

  async update (ctx) {
    const { user_id, fields } = ctx.request.body
    try {
      const contact = await strapi.query('contacts').model.findOneAndUpdate({
        user_id: ObjectId(user_id),
        _id: ObjectId(fields._id)
      }, fields, {
        new: true
      })

      if (!contact) {
        ctx.response.status = 400
        ctx.response.message = 'contact not found'
        return
      }

      return contact
    } catch (err) {
      console.error(err.message)
      ctx.response.status = 400
      ctx.response.message = 'Update failed'
    }
  },

  async findOne (ctx) {
    const { user_id, _id } = ctx.request.query
    if (!user_id || !_id) return
    // `ObjectId` can throw https://github.com/mongodb/js-bson/blob/0.5/lib/bson/objectid.js#L22-L51, it's better anyway to sanitize the string first
    if (!ObjectId.isValid(user_id)) {
      return Promise.reject(new TypeError(`Invalid user_id: ${user_id}`));
    }
    // `ObjectId` can throw https://github.com/mongodb/js-bson/blob/0.5/lib/bson/objectid.js#L22-L51, it's better anyway to sanitize the string first
    if (!ObjectId.isValid(_id)) {
      return Promise.reject(new TypeError(`Invalid _id: ${_id}`));
    }
    
    try {
      const value = await strapi.query('contacts').model.findOne({
        _id: ObjectId(_id),
        user_id: ObjectId(user_id)
      })

      return value
    } catch (err) {
      console.error(err.message)
      ctx.response.status = 400
      ctx.response.message = 'find contacts failed'
    }
  }

};
