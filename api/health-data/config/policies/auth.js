const policy = require("../../../../authConfig/policy")

module.exports = async (ctx, next) => {
  await policy(ctx, next)
};
