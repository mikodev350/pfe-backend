"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::profil.profil", ({ strapi }) => ({
  parseArrayField: (field) => {
    try {
      return Array.isArray(field) ? field : JSON.parse(field);
    } catch (e) {
      return [];
    }
  },

  async create(ctx) {
    try {
      const {
        typeEtudes,
        niveauEtudes,
        niveauSpecifique,
        specialite,
        etablisement,
        competences,
        bio,
        matieresEnseignees,
        niveauEnseigne,
        specialiteEnseigne,
        photoProfil,
        nomFormation,
      } = ctx.request.body;

      const user = ctx.state.user;

      const createData = {
        typeEtudes,
        niveauEtudes: nomFormation ? "rien" : niveauEtudes,
        niveauSpecifique,
        specialite,
        etablisement,
        competences: this.parseArrayField(competences),
        bio,
        matieresEnseignees: this.parseArrayField(matieresEnseignees),
        niveauEnseigne,
        specialiteEnseigne,
        photoProfil,
        nomFormation,
        users_permissions_user: user.id,
        publishedAt: new Date(), // Ensure the profile is published immediately
      };

      console.log("createData:", createData); // Log to verify the data

      const newProfil = await strapi.entityService.create(
        "api::profil.profil",
        {
          data: createData,
        }
      );

      ctx.send({
        message: "Profile created successfully",
        data: newProfil,
      });
    } catch (error) {
      console.log("Validation error details:", error); // Log validation errors
      strapi.log.error(error);
      ctx.throw(500, "Error creating profile");
    }
  },

  async update(ctx) {
    try {
      const { id } = ctx.params;
      const {
        typeEtudes,
        niveauEtudes,
        niveauSpecifique,
        specialite,
        etablisement,
        competences,
        bio,
        matieresEnseignees,
        niveauEnseigne,
        specialiteEnseigne,
        photoProfil,
        nomFormation,
      } = ctx.request.body;

      const updateData = {
        typeEtudes,
        niveauEtudes: nomFormation ? "rien" : niveauEtudes,
        niveauSpecifique,
        specialite,
        etablisement,
        competences: this.parseArrayField(competences),
        bio,
        matieresEnseignees: this.parseArrayField(matieresEnseignees),
        niveauEnseigne,
        specialiteEnseigne,
        photoProfil,
        nomFormation,
        publishedAt: new Date(), // Ensure the profile is published immediately
      };

      console.log("updateData:", updateData); // Log to verify the data

      const updatedProfile = await strapi.entityService.update(
        "api::profil.profil",
        id,
        {
          data: updateData,
        }
      );

      ctx.send({
        message: "Profile updated successfully",
        data: updatedProfile,
      });
    } catch (error) {
      console.log("Validation error details:", error); // Log validation errors
      strapi.log.error(error);
      ctx.throw(500, "Error updating profile");
    }
  },
}));
