const jwt = require("./jwt")

module.exports = async function (ctx, next) {
  try {
    if (jwt.decode(ctx.request.query.jwt.split(' ')[1])) {
      // Go to next policy or will reach the controller's action.
      return await next();
    }
  } catch (err) {
    console.error(err.message)
    ctx.unauthorized('Não autorizado!');
  }
};
