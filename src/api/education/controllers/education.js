"use strict";

/**
 * education controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::education.education",
  ({ strapi }) => ({
    async find(ctx) {
      try {
        const user = ctx.state.user;
        const educations = await strapi.db
          .query("api::education.education")
          .findMany({
            where: { users_permissions_user: user.id },
          });
        ctx.send(educations);
      } catch (error) {
        ctx.send({ error: "Unable to fetch education entries" }, 500);
      }
    },
    async create(ctx) {
      try {
        const {
          ecole,
          diplome,
          domaineEtude,
          dateDebut,
          dateFin,
          ecoleActuelle,
          descriptionProgramme,
        } = ctx.request.body;

        const user = ctx.state.user;

        const newEducation = await strapi
          .service("api::education.education")
          .create({
            data: {
              ecole,
              diplome,
              domaineEtude,
              dateDebut,
              dateFin,
              ecoleActuelle,
              descriptionProgramme,
              users_permissions_user: user.id,
            },
          });

        ctx.send(newEducation, 201);
      } catch (error) {
        ctx.send({ error: "Unable to create education entry" }, 500);
      }
    },

    async findOne(ctx) {
      try {
        const { id } = ctx.params;
        const user = ctx.state.user;

        const education = await strapi.db
          .query("api::education.education")
          .findOne({
            where: { id, users_permissions_user: user.id },
          });

        ctx.send(education);
      } catch (error) {
        ctx.send({ error: "Unable to fetch education entry" }, 500);
      }
    },

    async update(ctx) {
      try {
        const { id } = ctx.params;
        const {
          ecole,
          diplome,
          domaineDetude,
          dateDebut,
          dateFin,
          ecoleActuelle,
          descriptionProgramme,
        } = ctx.request.body;

        const user = ctx.state.user;

        const updatedEducation = await strapi
          .service("api::education.education")
          .update(id, {
            data: {
              ecole,
              diplome,
              domaineDetude,
              dateDebut,
              dateFin,
              ecoleActuelle,
              descriptionProgramme,
              users_permissions_user: user.id,
            },
          });

        ctx.send(updatedEducation, 200);
      } catch (error) {
        ctx.send({ error: "Unable to update education entry" }, 500);
      }
    },
  })
);
