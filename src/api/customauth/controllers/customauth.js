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
        roleId = 3; // Assuming 4 is the role ID for students
        break;
      case "teacher":
        roleId = 4; // Assuming 3 is the role ID for teachers
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

      const updatedUser = await strapi
        .query("plugin::users-permissions.user")
        .update({ where: { id: userId }, data: { role: roleId } });

      console.log(updatedUser);

      // updatedUser.password;
      // updatedUser.resetPasswordToken;

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

  async findUserByEmail(ctx) {
    try {
      const { email } = ctx.request.body;

      // Vérifier si l'email est fourni
      if (!email) {
        return ctx.badRequest("Email requis");
      }

      // Chercher l'utilisateur via l'email dans la base de données
      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: { email } });

      if (!user) {
        return ctx.notFound("Utilisateur non trouvé");
      }

      // Retourner l'utilisateur trouvé
      ctx.send({
        message: "Utilisateur trouvé",
        data: user,
      });
    } catch (error) {
      ctx.send({
        error: "Erreur lors de la récupération de l'utilisateur",
        message: error.message,
      });
    }
  },

  // Forgot Password
  async forgotPassword(ctx) {
    try {
      const { email } = ctx.request.body;

      // Check if email is provided
      if (!email) {
        return ctx.badRequest("Please provide a valid email address");
      }

      // Find the user by email
      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: { email } });

      // If user doesn't exist, return an error
      if (!user) {
        return ctx.notFound("No user found with this email");
      }

      console.log("====================================");
      console.log(user);
      console.log("====================================");

      // Instead of sending an email, return the token in the response (for simplicity)
      return ctx.send({
        message: "Here is your reset token",
        token: user,
      });
    } catch (error) {
      console.error("Error during forgot password:", error);
      return ctx.internalServerError("An error occurred during the process");
    }
  },

  // Reset Password
  async resetPassword(ctx) {
    try {
      const { token, newPassword } = ctx.request.body;

      // Validate the token and new password
      if (!token || !newPassword) {
        return ctx.badRequest("Please provide the token and new password");
      }

      // Find the user with the matching token
      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: { resetPasswordToken: token } });

      if (!user) {
        return ctx.badRequest("Invalid or expired token");
      }

      // Hash the new password and update it
      const hashedPassword = await strapi
        .service("plugin::users-permissions.user")
        .hashPassword(newPassword);

      // Update the user's password and remove the token
      await strapi.query("plugin::users-permissions.user").update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null, // Clear the token
        },
      });

      return ctx.send({
        message: "Password successfully reset",
      });
    } catch (error) {
      console.error("Error during password reset:", error);
      return ctx.internalServerError(
        "An error occurred while resetting the password"
      );
    }
  },
};
