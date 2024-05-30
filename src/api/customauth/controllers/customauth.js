// ./src/api/customauth/controllers/customauth.js

// http://localhost:1337/api/user-custom/update-role this after the user create account
module.exports = {
  async updateRole(ctx) {
    const { role } = ctx.request.body;
    const token = ctx.request.headers.authorization?.split(" ")[1];

    if (!token) {
      return ctx.unauthorized("No token provided");
    }

    let userId;

    try {
      const decoded = await strapi.plugins[
        "users-permissions"
      ].services.jwt.verify(token);
      userId = decoded.id;
    } catch (err) {
      return ctx.unauthorized("Invalid token");
    }

    if (!role) {
      return ctx.badRequest("Please provide the new role");
    }

    try {
      // Check if the role exists
      const existingRole = await strapi
        .query("plugin::users-permissions.role")
        .findOne({ where: { id: role } });
      if (!existingRole) {
        return ctx.badRequest("Role does not exist");
      }

      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: { id: userId } });

      if (!user) {
        return ctx.notFound("User not found");
      }

      const updatedUser = await strapi
        .query("plugin::users-permissions.user")
        .update({ where: { id: userId }, data: { role } });

      // Remove sensitive fields
      delete updatedUser.password;
      delete updatedUser.resetPasswordToken;

      return ctx.send(updatedUser);
    } catch (err) {
      return ctx.internalServerError("Something went wrong");
    }
  },
  async find(ctx) {
    try {
      // Log de débogage
      console.log("Find request received");

      // Récupérer tous les parcours
      const pathways = await strapi.entityService.findMany(
        "api::parcour.parcour"
      );

      console.log("Retrieved pathways:", pathways);

      ctx.send({
        message: "Pathways retrieved successfully",
        data: pathways,
      });
    } catch (error) {
      console.error("Error retrieving pathways:", error);
      ctx.throw(500, "An error occurred while retrieving the pathways");
    }
  },
};
