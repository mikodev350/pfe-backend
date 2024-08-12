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
        const { devoir, etudiants, type } = ctx.request.body;
        const professeur = ctx.state.user.id;
        console.log("====================================");
        console.log(ctx.request.body);
        console.log("====================================");
        const createData = {
          devoir,
          etudiants,
          professeur,
          type,
          createdAt: new Date(),
        };

        // const newAssignation = await strapi.entityService.create(
        //   "api::assignation.assignation",
        //   { data: createData }
        // );

        ctx.send({
          message: "Assignation créée avec succès",
          //   data: newAssignation,
        });
      } catch (error) {
        console.error("Erreur lors de la création de l'assignation:", error);
        ctx.throw(500, "Erreur lors de la création de l'assignation");
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
