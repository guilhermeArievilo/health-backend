'use strict';
const { ObjectId } = require('mongodb'); // or ObjectID 
const bcrypt = require('bcryptjs')
const jwt = require("../../../authConfig/jwt")

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async fetchUser (ctx) {
    const { _id } = ctx.request.body
    if (!_id) return
    // `ObjectId` can throw https://github.com/mongodb/js-bson/blob/0.5/lib/bson/objectid.js#L22-L51, it's better anyway to sanitize the string first
    if (!ObjectId.isValid(_id)) {
      return Promise.reject(new TypeError(`Invalid id: ${_id}`));
    }
    const pipeline = [
      {
        $match: {
          _id: ObjectId(_id),
          published_at: {
            $ne: null
          }
        }
      },
      {
        $project: {
          alias: 1,
          username: 1,
          token: 1,
          fullName: 1,
          email: 1,
          birthDate: 1,
          phone: 1,
          occupation: 1,
          img: 1
        }
      },
      {
        $lookup: {
          from: 'upload_file',
          as: 'img',
          localField: 'img',
          foreignField: '_id'
        }
      },
      { $unwind: { path: "$img", preserveNullAndEmptyArrays: true } }
    ]

    const data = await strapi.query('app-users').model
      .aggregate(pipeline)
      .allowDiskUse(true)

    return data[0]
  },

  async update (ctx) {
    const { user_id, fields } = ctx.request.body
    try {
      const user = await strapi.query('app-users').model.findOneAndUpdate({ _id: user_id }, fields, {
        new: true
      })

      if (!user) {
        ctx.response.status = 400
        ctx.response.message = 'User not found'
        return
      }
      user.password = undefined
      return user
    } catch (err) {
      console.error(err.message)
      ctx.response.status = 400
      ctx.response.message = 'Update failed'
    }
  },

  async login (ctx) {
    const { identifier, password } = ctx.request.body
    // const [hashType, hash64] = ctx.request.headers.authorization
    // const [identifier, password] = Buffer.from(hash64, 'base64').toString().split(':')

    try {
      const user = await strapi.query('app-users').model.findOne({ 
        email: identifier,
        published_at: {
          $ne: null
        }
       }).select('+password')
      
      if (!user) {
        ctx.response.status = 400
        ctx.response.message = 'User not found'
        return
      }

      if (!await bcrypt.compare(password, user.password)) {
        ctx.response.status = 400
        ctx.response.message = 'Invalid password'
        return
      }

      user.password = undefined
      
      const token = jwt.sign({ user: user._id })
      return {
        user: {
          email: user.email,
          alias: user.alias,
          _id: user._id
        },
        jwt: token
      }
    } catch (err) {
      console.error(err.message)
      ctx.response.status = 400
      ctx.response.message = 'Login failed'
    }
  },

  async register (ctx) {
    const { email, password, fields, healthData, weight } = ctx.request.body
    try {
      if (await strapi.query('app-users').model.findOne({ email })) {
        ctx.response.status = 400
        ctx.response.message = 'Usuário já existe !'
      }

      const hash = await bcrypt.hash(password, 10)
      // ctx.request.body.password = hash

      const userToken = fields.alias + '#' + Math.floor(Math.random() * 65536).toString().slice(0, 4)

      const user = await strapi.query('app-users').model.create({
        email,
        password: hash,
        token: userToken,
        ...fields,
        published_at: new Date().toString()
      })

      if (user && healthData) {
        const health = await strapi.query('health-data').model.create({
          ...healthData,
          user_id: user._id,
          published_at: new Date().toString()
        })

        if (health && weight) {
          await strapi.query('weight').model.create({
            health_id: health._id,
            value: weight,
            published_at: new Date().toString()
          })
        }
      }

      const token = jwt.sign({ user: user._id })
      user.password = undefined
      return {
        jwt: token,
        user: user
      }
    } catch (err) {
      console.error(err.message)
      ctx.response.status = 400
      ctx.response.message = 'Registration failed'
    }
  }
};
