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
      const value = await strapi.query('pathologies').model.find({
        health_id: ObjectId(health_id),
        published_at: {
          $ne: null
        }
      })
        .limit(Number(limit))

      return value
    } catch (err) {
      console.error(err.message)
      ctx.response.status = 400
      ctx.response.message = 'find pathologies failed'
    }
  },

  async findByAggregate (ctx) {
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
            from: "medicines",
            let: { pathology_id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                      $in: ['$$pathology_id', "$pathologies_id"]
                  },
                  published_at: {
                    $ne: null
                  }
                }
              }
            ],
            as: "medicines"
          }
        },
        {
          $lookup: {
            from: "exams",
            let: { pathology_id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$pathologie_id", "$$pathology_id"]
                  },
                  published_at: {
                    $ne: null
                  }
                }
              }
            ],
            as: "exams"
          }
        },
        {
          $lookup: {
            from: "groups",
            let: { pathology_id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$pathologie_id", "$$pathology_id"]
                  }
                }
              },
              {
                $lookup: {
                  from: "exams",
                  localField: "_id",
                  foreignField: "group_id",
                  as: "exams"
                }
              }
            ],
            as: "groups"
          }
        }
      ]
      if (limit) {
        pipeline.push({
          $limit: Number(limit)
        })
      }
      const data = await strapi.query('pathologies').model
        .aggregate(pipeline)
        .allowDiskUse(true)

      return data
    } catch (err) {
      console.error(err.message)
      ctx.response.status = 400
      ctx.response.message = 'find pathologies failed'
    }

  },

  async findOne (ctx) {
    const { health_id, _id } = ctx.request.query
    if (!health_id) return
    // `ObjectId` can throw https://github.com/mongodb/js-bson/blob/0.5/lib/bson/objectid.js#L22-L51, it's better anyway to sanitize the string first
    if (!ObjectId.isValid(health_id)) {
      return Promise.reject(new TypeError(`Invalid id: ${health_id}`));
    }
    // `ObjectId` can throw https://github.com/mongodb/js-bson/blob/0.5/lib/bson/objectid.js#L22-L51, it's better anyway to sanitize the string first
    if (!ObjectId.isValid(_id)) {
      return Promise.reject(new TypeError(`Invalid _id: ${_id}`));
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
            from: "medicines",
            let: { pathology_id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                      $in: ['$$pathology_id', "$pathologies_id"]
                  },
                  published_at: {
                    $ne: null
                  }
                }
              }
            ],
            as: "medicines"
          }
        },
        {
          $lookup: {
            from: "exams",
            let: { pathology_id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$pathologie_id", "$$pathology_id"]
                  },
                  published_at: {
                    $ne: null
                  }
                }
              }
            ],
            as: "exams"
          }
        },
        {
          $lookup: {
            from: "groups",
            let: { pathology_id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$pathologie_id", "$$pathology_id"]
                  },
                  published_at: {
                    $ne: null
                  }
                }
              },
              {
                $lookup: {
                  from: "exams",
                  localField: "_id",
                  foreignField: "group_id",
                  as: "exams"
                }
              }
            ],
            as: "groups"
          }
        }
      ]

      const data = await strapi.query('pathologies').model
        .aggregate(pipeline)
        .allowDiskUse(true)

      return data ? data[0] : null
    } catch (err) {
      console.error(err.message)
      ctx.response.status = 400
      ctx.response.message = 'find pathology failed'
    }
  },

  async update (ctx) {
    const { health_id, fields } = ctx.request.body
    try {
      const pathology = await strapi.query('pathologies').model.findOneAndUpdate({
        health_id: ObjectId(health_id),
        _id: ObjectId(fields._id)
      }, fields, {
        new: true
      })

      if (!pathology) {
        ctx.response.status = 400
        ctx.response.message = 'pathology not found'
        return
      }

      return pathology
    } catch (err) {
      console.error(err.message)
      ctx.response.status = 400
      ctx.response.message = 'Update failed'
    }
  }
};
