"use strict";

/**
 * experience controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::experience.experience",
  ({ strapi }) => ({
    async find(ctx) {
      try {
        const user = ctx.state.user;
        const experiences = await strapi.db
          .query("api::experience.experience")
          .findMany({
            where: { users_permissions_user: user.id },
          });
        ctx.send(experiences);
      } catch (error) {
        ctx.send({ error: "Unable to fetch experience entries" }, 500);
      }
    },
    async create(ctx) {
      try {
        const {
          titrePoste,
          entreprise,
          localisation,
          dateDebut,
          dateFin,
          posteActuel,
          descriptionPoste,
        } = ctx.request.body;

        const user = ctx.state.user;

        const newExperience = await strapi
          .service("api::experience.experience")
          .create({
            data: {
              titrePoste,
              entreprise,
              localisation,
              dateDebut,
              dateFin,
              posteActuel,
              descriptionPoste,
              users_permissions_user: user.id,
            },
          });

        ctx.send(newExperience, 201);
      } catch (error) {
        ctx.send({ error: "Impossible de créer une entrée d'expérience" }, 500);
      }
    },
    /*********************************************************************/
    async findOne(ctx) {
      try {
        const { id } = ctx.params;
        const user = ctx.state.user;

        const experience = await strapi.db
          .query("api::experience.experience")
          .findOne({
            where: { id, users_permissions_user: user.id },
          });

        ctx.send(experience);
      } catch (error) {
        ctx.send({ error: "Unable to fetch experience entry" }, 500);
      }
    },
    /*********************************************************************/

    async update(ctx) {
      try {
        const { id } = ctx.params;
        const {
          titrePoste,
          entreprise,
          localisation,
          dateDebut,
          dateFin,
          posteActuel,
          descriptionPoste,
        } = ctx.request.body;

        const user = ctx.state.user;

        const updatedExperience = await strapi
          .service("api::experience.experience")
          .update(id, {
            data: {
              titrePoste,
              entreprise,
              localisation,
              dateDebut,
              dateFin,
              posteActuel,
              descriptionPoste,
              users_permissions_user: user.id,
            },
          });

        ctx.send(updatedExperience, 200);
      } catch (error) {
        ctx.send({ error: "Unable to update experience entry" }, 500);
      }
    },
  })
);
