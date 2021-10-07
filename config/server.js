module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1340),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', '7c7fbadd901935a745ef4b1853c06fec'),
    },
  },
});
