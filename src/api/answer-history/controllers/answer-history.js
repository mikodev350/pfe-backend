"use strict";

/**
 * answer-history controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::answer-history.answer-history",
  ({ strapi }) => ({
    async putDevoir(ctx) {
      try {
        const { answer, attachement } = ctx.request.body;

        // attachement
        // etudiant  assignation

        score;
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
  })
);
