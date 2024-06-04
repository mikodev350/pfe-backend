"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::profil.profil", ({ strapi }) => ({
  // Méthode pour créer un profil
  async create(ctx) {
    try {
      const {
        niveauEtudes,
        programmeEtudes,
        anneeEtudes,
        institution,
        competences,
        experienceStage,
        projets,
        bio,
        niveauFormation,
        photoProfil,
      } = ctx.request.body;

      const user = ctx.state.user;

      const createData = {
        niveauEtudes,
        programmeEtudes,
        anneeEtudes,
        institution,
        competences: Array.isArray(competences)
          ? competences
          : JSON.parse(competences),
        experienceStage,
        projets,
        bio,
        niveauFormation,
        photoProfil,
        users_permissions_user: user.id,
      };

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
      strapi.log.error(error);
      ctx.throw(500, "Error creating profile");
    }
  },

  // Méthode pour mettre à jour le profil de l'utilisateur connecté
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const {
        niveauEtudes,
        programmeEtudes,
        anneeEtudes,
        institution,
        competences,
        experienceStage,
        projets,
        bio,
        niveauFormation,
        photoProfil,
      } = ctx.request.body;

      const updateData = {
        niveauEtudes,
        programmeEtudes,
        anneeEtudes,
        institution,
        competences: Array.isArray(competences)
          ? competences
          : JSON.parse(competences),
        experienceStage,
        projets,
        bio,
        niveauFormation,
        photoProfil,
      };

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
      strapi.log.error(error);
      ctx.throw(500, "Error updating profile");
    }
  },
}));
