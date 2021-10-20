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
      const pipeline = [
        {
          $match: {
            health_id: ObjectId(health_id),
            published_at: {
              $ne: null
            }
          }
        },
        {
          $lookup: {
            from: "exams",
            let: { group_id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$pathologie_id", "$$group_id"]
                  },
                  published_at: {
                    $ne: null
                  }
                }
              }
            ],
            as: "exams"
          }
        }
      ]
      if (limit) {
        pipeline.push({
          $limit: Number(limit)
        })
      }
      const data = await strapi.query('exams').model
        .aggregate(pipeline)
        .allowDiskUse(true)

      return data
    } catch (err) {
      console.error(err.message)
      ctx.response.status = 400
      ctx.response.message = 'find exams failed'
    }
  },

  async findOne (ctx) {
    const { health_id, _id } = ctx.request.query
    if (!health_id) return
    console.log(_id)
    // `ObjectId` can throw https://github.com/mongodb/js-bson/blob/0.5/lib/bson/objectid.js#L22-L51, it's better anyway to sanitize the string first
    if (!ObjectId.isValid(health_id)) {
      return Promise.reject(new TypeError(`Invalid id: ${health_id}`));
    }
    // `ObjectId` can throw https://github.com/mongodb/js-bson/blob/0.5/lib/bson/objectid.js#L22-L51, it's better anyway to sanitize the string first
    if (!ObjectId.isValid(_id)) {
      return Promise.reject(new TypeError(`Invalid id: ${_id}`));
    }

    try {
      const pipeline = [
        {
          $match: {
            _id: ObjectId(_id),
            health_id: ObjectId(health_id),
            published_at: {
              $ne: null
            }
          }
        },
        {
          $lookup: {
            from: "exams",
            let: { group_id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$group_id", "$$group_id"]
                  },
                  published_at: {
                    $ne: null
                  }
                }
              }
            ],
            as: "exams"
          }
        }
      ]

      const data = await strapi.query('groups').model
        .aggregate(pipeline)
        .allowDiskUse(true)

      return data[0]
    } catch (err) {
      console.error(err.message)
      ctx.response.status = 400
      ctx.response.message = 'find group failed'
    }
  },

  async update (ctx) {
    const { health_id, fields } = ctx.request.body
    try {
      const value = await strapi.query('groups').model.findOneAndUpdate({
        health_id: ObjectId(health_id),
        _id: ObjectId(fields._id)
      }, fields, {
        new: true
      })

      if (!value) {
        ctx.response.status = 400
        ctx.response.message = 'group not found'
        return
      }

      return value
    } catch (err) {
      console.error(err.message)
      ctx.response.status = 400
      ctx.response.message = 'Update failed'
    }
  }
};
