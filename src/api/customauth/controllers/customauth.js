"use strict";

module.exports = {
  async updateRole(ctx) {
    const { role } = ctx.request.body;
    const userId = ctx.state.user.id;
    if (!role) {
      return ctx.badRequest("Please provide the new role");
    }

    console.log(userId);

    let roleId;
    switch (role.toLowerCase()) {
      case "student":
        roleId = 4; // Assuming 4 is the role ID for students
        break;
      case "teacher":
        roleId = 3; // Assuming 3 is the role ID for teachers
        break;
      default:
        return ctx.badRequest(
          "Invalid role provided. Must be 'student' or 'teacher'."
        );
    }

    console.log("====================================");
    console.log("roleId");

    console.log(roleId);
    console.log("====================================");
    try {
      const existingRole = await strapi
        .query("plugin::users-permissions.role")
        .findOne({ where: { id: roleId } });

      console.log("====================================");
      console.log("existingRole");

      console.log(existingRole);
      console.log("====================================");
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
        .update({ where: { id: userId }, data: { role: roleId } });

      delete updatedUser.password;
      delete updatedUser.resetPasswordToken;

      return ctx.send({ updatedUser, role: existingRole.name });
    } catch (err) {
      console.error("Error updating role:", err);
      return ctx.internalServerError("Something went wrong");
    }
  },

  async find(ctx) {
    try {
      console.log("Find request received");

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
