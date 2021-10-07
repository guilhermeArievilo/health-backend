const jwt = require("../../../../authConfig/jwt")

module.exports = async (ctx, next) => {
  try {
    console.log(ctx)
    if (jwt.decode(ctx.request.header.jwt.split(' ')[1])) {
      // Go to next policy or will reach the controller's action.
      return await next();
    }
  } catch {
    ctx.unauthorized('Não autorizado!');
  }
};
