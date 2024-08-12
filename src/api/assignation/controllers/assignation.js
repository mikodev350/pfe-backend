"use strict";

/**
 * assignation controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::assignation.assignation",
  ({ strapi }) => ({
    // Create a new assignation
    async create(ctx) {
      try {
        const { entityId, userIds, type, assignments, TypeOfasssignation } =
          ctx.request.body;
        const professeur = ctx.state.user.id;

        if (type === "GROUP") {
          // Boucle sur chaque étudiant
          for (const etudiant of userIds) {
            // Boucle sur chaque assignment si c'est un tableau
            for (const assignment of assignments) {
              const createData = {
                etudiant: etudiant,
                professeur: professeur,
                devoir: TypeOfasssignation === "DEVOIR" ? assignment : null,
                group: entityId,
                createdAt: new Date(),
              };

              // Créer l'assignation pour l'étudiant et l'assignation courants
              await strapi.entityService.create(
                "api::assignation.assignation",
                {
                  data: createData,
                }
              );
            }
          }
        } else if (type === "INDIVIDUEL") {
          for (const assignment of assignments) {
            const createData = {
              etudiant: userIds[0],
              professeur: professeur,
              devoir: TypeOfasssignation === "DEVOIR" ? assignment : null,
              group: entityId,
              createdAt: new Date(),
            };

            // Créer l'assignation pour l'étudiant et l'assignation courants
            await strapi.entityService.create("api::assignation.assignation", {
              data: createData,
            });
          }
        }
        ctx.send({
          message: "Assignations créées avec succès",
        });
      } catch (error) {
        console.error("Erreur lors de la création des assignations:", error);
        ctx.throw(500, "Erreur lors de la création des assignations");
      }
    },

    // Get all assignations
    async find(ctx) {
      try {
        const assignations = await strapi.entityService.findMany(
          "api::assignation.assignation",
          {
            populate: ["devoir", "etudiant", "professeur"],
          }
        );
        ctx.send(assignations);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des assignations:",
          error
        );
        ctx.throw(500, "Erreur lors de la récupération des assignations");
      }
    },

    // Get a single assignation by ID
    async findOne(ctx) {
      try {
        const { id } = ctx.params;

        const assignation = await strapi.entityService.findOne(
          "api::assignation.assignation",
          id,
          {
            populate: ["devoir", "etudiant", "professeur"],
          }
        );

        if (!assignation) {
          return ctx.throw(404, "Assignation non trouvée");
        }

        ctx.send(assignation);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'assignation:",
          error
        );
        ctx.throw(500, "Erreur lors de la récupération de l'assignation");
      }
    },

    // Update an assignation by ID
    async update(ctx) {
      try {
        const { id } = ctx.params;
        const { devoir, etudiant, professeur, type } = ctx.request.body;

        const updateData = {
          devoir,
          etudiant,
          professeur,
          type,
        };

        const updatedAssignation = await strapi.entityService.update(
          "api::assignation.assignation",
          id,
          { data: updateData }
        );

        ctx.send({
          message: "Assignation mise à jour avec succès",
          data: updatedAssignation,
        });
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'assignation:", error);
        ctx.throw(500, "Erreur lors de la mise à jour de l'assignation");
      }
    },

    // Delete an assignation by ID
    async delete(ctx) {
      try {
        const { id } = ctx.params;

        const existingAssignation = await strapi.entityService.findOne(
          "api::assignation.assignation",
          id
        );

        if (!existingAssignation) {
          return ctx.throw(404, "Assignation non trouvée");
        }

        await strapi.entityService.delete("api::assignation.assignation", id);

        ctx.send({ message: "Assignation supprimée avec succès" });
      } catch (error) {
        console.error("Erreur lors de la suppression de l'assignation:", error);
        ctx.throw(500, "Erreur lors de la suppression de l'assignation");
      }
    },
  })
);
