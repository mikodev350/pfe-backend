// ./src/middlewares/auth.js

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const token = ctx.request.headers.authorization?.split(" ")[1];

    if (!token) {
      return ctx.unauthorized("No token provided");
    }

    try {
      const decoded = await strapi.plugins[
        "users-permissions"
      ].services.jwt.verify(token);
      const user = await strapi
        .query("user", "users-permissions")
        .findOne({ id: decoded.id });

      console.log(user);
      if (!user) {
        return ctx.unauthorized("User not found");
      }

      ctx.state.user = user; // Add user data to the context
      await next();
    } catch (err) {
      return ctx.unauthorized("Invalid token");
    }
  };
};
