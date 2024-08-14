"use strict";

/**
 * answer-history controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::answer-history.answer-history",
  ({ strapi }) => ({
    async create(ctx) {
      try {
        const { answer, attachement } = ctx.request.body;

        // Obtenir l'ID de l'étudiant depuis l'utilisateur authentifié
        const studentId = ctx.state.user.id;

        // Vérification des attachements reçus
        if (!Array.isArray(attachement) || attachement.length === 0) {
          return ctx.throw(
            400,
            "Attachments should be an array with at least one item."
          );
        }

        console.log(attachement);

        // Validation des IDs d'attachement
        const validAttachments = await Promise.all(
          attachement.map(async (attachId) => {
            try {
              const file = await strapi.entityService.findOne(
                "plugin::upload.file",
                attachId
              );
              if (file) {
                return attachId; // ID valide
              } else {
                console.warn(`Invalid attachment ID: ${attachId}`);
                return null;
              }
            } catch (error) {
              console.error(`Error fetching file with ID ${attachId}:`, error);
              return null;
            }
          })
        );

        // Filtrer les attachements valides
        const filteredAttachments = validAttachments.filter(
          (id) => id !== null
        );

        console.log("====================================");
        console.log(filteredAttachments);
        console.log("====================================");
        // Vérification finale
        if (filteredAttachments.length === 0) {
          return ctx.throw(400, "No valid attachment IDs provided.");
        }

        // Préparer les données pour la création
        const createData = {
          answer,
          student: studentId,
          attachement: filteredAttachments,
          createdAt: new Date(),
        };
        console.log("createData");

        console.log(createData);

        // Créer l'entrée `AnswerHistory`
        const newAnswerHistory = await strapi.db
          .query("api::answer-history.answer-history")
          .create({
            data: createData,
          });

        console.log("====================================");
        console.log("newAnswerHistory");

        console.log(newAnswerHistory);
        console.log("====================================");
        // Récupérer l'entrée nouvellement créée avec relations peuplées
        const answerHistoryWithRelations = await strapi.entityService.findOne(
          "api::answer-history.answer-history",
          newAnswerHistory.id,
          {
            populate: ["attachment", "student"],
          }
        );

        // Envoyer la réponse
        ctx.send({
          message: "AnswerHistory created successfully",
          data: answerHistoryWithRelations,
        });
      } catch (error) {
        console.error("Error creating AnswerHistory:", error);
        ctx.throw(500, "Error creating AnswerHistory");
      }
    },
    async update(ctx) {
      try {
        const { id } = ctx.params;
        const { answer, attachement } = ctx.request.body;

        // Obtenir l'ID de l'étudiant depuis l'utilisateur authentifié
        const studentId = ctx.state.user.id;

        // Validation des IDs d'attachement
        const validAttachments = await Promise.all(
          attachement.map(async (attachId) => {
            try {
              const file = await strapi.entityService.findOne(
                "plugin::upload.file",
                attachId
              );
              if (file) {
                return attachId; // ID valide
              } else {
                console.warn(`Invalid attachment ID: ${attachId}`);
                return null;
              }
            } catch (error) {
              console.error(`Error fetching file with ID ${attachId}:`, error);
              return null;
            }
          })
        );

        // Filtrer les attachements valides
        const filteredAttachments = validAttachments.filter(
          (id) => id !== null
        );

        // Vérification finale
        if (filteredAttachments.length === 0) {
          return ctx.throw(400, "No valid attachment IDs provided.");
        }

        // Préparer les données pour la mise à jour
        const updateData = {
          answer,
          student: studentId,
          attachement: filteredAttachments,
        };

        // Mettre à jour l'entrée `AnswerHistory`
        const updatedAnswerHistory = await strapi.db
          .query("api::answer-history.answer-history")
          .update({
            where: { id },
            data: updateData,
          });

        if (!updatedAnswerHistory) {
          return ctx.throw(404, "AnswerHistory not found");
        }

        // Récupérer l'entrée mise à jour avec relations peuplées
        const answerHistoryWithRelations = await strapi.entityService.findOne(
          "api::answer-history.answer-history",
          updatedAnswerHistory.id,
          {
            populate: ["attachment", "student"], // Peupler les relations
          }
        );

        // Envoyer la réponse
        ctx.send({
          message: "AnswerHistory updated successfully",
          data: answerHistoryWithRelations,
        });
      } catch (error) {
        console.error("Error updating AnswerHistory:", error);
        ctx.throw(500, "Error updating AnswerHistory");
      }
    },
    async findOne(ctx) {
      try {
        const { id } = ctx.params;

        // Récupérer l'entrée avec les relations peuplées
        const answerHistory = await strapi.entityService.findOne(
          "api::answer-history.answer-history",
          id,
          {
            populate: ["attachment", "student"], // Peupler les relations
          }
        );

        if (!answerHistory) {
          return ctx.throw(404, "AnswerHistory not found");
        }

        // Envoyer la réponse
        ctx.send({
          message: "AnswerHistory found successfully",
          data: answerHistory,
        });
      } catch (error) {
        console.error("Error fetching AnswerHistory:", error);
        ctx.throw(500, "Error fetching AnswerHistory");
      }
    },
  })
);
