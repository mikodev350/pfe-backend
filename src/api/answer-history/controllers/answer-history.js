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
        const { devoirId } = ctx.query;
        const { answer, attachement } = ctx.request.body;
        console.log("====================================");
        console.log(ctx.request.body);
        console.log("====================================");
        // Get the student ID from the authenticated user
        const studentId = ctx.state.user.id;

        // Ensure attachments are provided and valid
        if (!Array.isArray(attachement) || attachement.length === 0) {
          return ctx.throw(
            400,
            "Attachments should be an array with at least one item."
          );
        }

        // Validate attachment IDs
        const validAttachments = await Promise.all(
          attachement.map(async (attachId) => {
            try {
              const file = await strapi.entityService.findOne(
                "plugin::upload.file",
                attachId
              );
              if (file) {
                return attachId;
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

        // Filter valid attachments
        const filteredAttachments = validAttachments.filter(
          (id) => id !== null
        );

        if (filteredAttachments.length === 0) {
          return ctx.throw(400, "No valid attachment IDs provided.");
        }

        // Vérifier si l'étudiant est assigné à ce devoir
        const assignation = await strapi.db
          .query("api::assignation.assignation")
          .findOne({
            where: {
              etudiant: studentId,
              devoir: { id: Number(devoirId) },
            },
          });
        // Check if an `AnswerHistory` already exists for this student and assignation
        let answerHistory = await strapi.db
          .query("api::answer-history.answer-history")
          .findOne({
            where: {
              student: studentId,
              assignation: assignation.id,
            },
          });

        if (answerHistory) {
          // Update the existing `AnswerHistory`
          answerHistory = await strapi.db
            .query("api::answer-history.answer-history")
            .update({
              where: { id: answerHistory.id },
              data: {
                answer,
                attachement: filteredAttachments,
                updatedAt: new Date(),
              },
            });

          ctx.send({
            message: "AnswerHistory updated successfully",
            data: answerHistory,
          });
        } else {
          // Create a new `AnswerHistory`
          const createData = {
            answer,
            student: studentId,
            assignation: assignation.id, // Link to the assignation
            attachement: filteredAttachments,
            createdAt: new Date(),
          };

          const newAnswerHistory = await strapi.db
            .query("api::answer-history.answer-history")
            .create({
              data: createData,
            });

          // Fetch the newly created entry with relations populated
          const answerHistoryWithRelations = await strapi.entityService.findOne(
            "api::answer-history.answer-history",
            newAnswerHistory.id,
            {
              populate: ["attachment", "student", "assignation"],
            }
          );

          ctx.send({
            message: "AnswerHistory created successfully",
            data: answerHistoryWithRelations,
          });
        }
      } catch (error) {
        console.error("Error processing AnswerHistory:", error);
        ctx.throw(500, "Error processing AnswerHistory");
      }
    },
    async checkDevoir(ctx) {
      try {
        const { devoirId } = ctx.query;
        const studentId = ctx.state.user.id;

        // Vérifier si l'étudiant est assigné à ce devoir
        const assignation = await strapi.db
          .query("api::assignation.assignation")
          .findOne({
            where: {
              etudiant: studentId,
              devoir: { id: Number(devoirId) },
            },
          });

        console.log("====================================");
        console.log("this is assignation pro maxx");
        console.log(assignation);
        console.log("====================================");
        if (!assignation) {
          return ctx.send({
            update: false,
            message: "Student is not assigned to this devoir",
          });
        }

        console.log("====================================");
        console.log("this is assgnation ");
        console.log(assignation.score);

        console.log("====================================");
        if (assignation.score) {
          // Mettre à jour le devoir ou effectuer d'autres opérations si nécessaire
          return ctx.send({
            update: true,
            message: "Score exists for this student and devoir",
          });
        } else {
          // Retourner false si le score n'existe pas
          return ctx.send({
            update: false,
            message: "No score found for this student and devoir",
          });
        }
      } catch (error) {
        console.error("Error checking devoir:", error);
        ctx.throw(500, "Internal server error");
      }
    },

    /*****************************************************************************/
    async findFilteredDevoir(ctx) {
      console.log(ctx.query);

      const { group, etudiant, devoir } = ctx.query;
      const professeur = ctx.state.user.id;

      try {
        // Création de conditions de filtrage
        const assignationFilters = {
          ...(group && { group: { id: Number(group) } }),
          ...(professeur && { professeur: { id: Number(professeur) } }),
          ...(etudiant && { etudiant: { id: Number(etudiant) } }),
          ...(devoir && { devoir: { id: Number(devoir) } }),
        };

        // Requête pour obtenir les assignations filtrées
        const assignations = await strapi.db
          .query("api::assignation.assignation")
          .findMany({
            where: assignationFilters,
            populate: [
              "etudiant",
              "attachement",
              "professeur",
              "devoir",
              "answer_histories",
            ],
          });

        // Filtrer les assignations qui ont des answer_histories
        const filteredAssignations = assignations.filter(
          (assignation) => assignation.answer_histories.length > 0
        );

        // Structure de réponse avec les informations de l'étudiant et des answer_histories
        const response = [];

        for (const assignation of filteredAssignations) {
          const assignationDetails = {
            assignationId: assignation.id,
            etudiant: assignation.etudiant.username, // Nom de l'étudiant
            devoir: assignation.devoir.titre, // Titre du devoir
            note: assignation.score,
            answer_histories: [],
          };

          // Parcourir chaque answer_history associé à l'assignation
          for (const history of assignation.answer_histories) {
            // Récupérer les informations de chaque answer_history
            const populatedHistory = await strapi.db
              .query("api::answer-history.answer-history")
              .findOne({
                where: { id: history.id },
                populate: ["attachement"], // Assurez-vous que les attachements sont bien peuplés
              });

            assignationDetails.answer_histories.push({
              answer: populatedHistory.answer, // Réponse
              attachements: populatedHistory.attachement, // Attachements (images)
            });
          }

          response.push(assignationDetails);
        }

        ctx.send(response);
      } catch (error) {
        console.error("Error fetching filtered AnswerHistory:", error);
        ctx.throw(500, "Internal server error");
      }
    },
  })
);
