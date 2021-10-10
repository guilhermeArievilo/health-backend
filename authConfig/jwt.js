const jwt = require('jsonwebtoken')

const secret = 'bbd2d5c83751e72a17a5b50a0c9bd93f'

module.exports = {
  sign (payload) {
    return jwt.sign(payload, secret, { expiresIn: 86400 })
  },

  decode (token) {
    return jwt.verify(token, secret)
  }
}
