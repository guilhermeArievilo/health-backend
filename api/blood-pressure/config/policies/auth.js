const policy = require("../../../../authConfig/policy")

module.exports = async (ctx, next) => {
  console.log(ctx.request)
  await policy(ctx, next)
};
