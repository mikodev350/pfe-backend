"use strict";

/**
 * reponse-etudiant controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::reponse-etudiant.reponse-etudiant",
  ({ strapi }) => ({
    async putDevoir(ctx) {
      try {
        const { devoirId } = ctx.query;
        const { reponse, attachement } = ctx.request.body;

        console.log("====================================");
        console.log("ctx.query");

        console.log(ctx.query);

        console.log("ctx.request.body");

        console.log(ctx.request.body);

        console.log("====================================");

        const assignation = await strapi.entityService.findOne(
          "api::assignation.assignation",
          devoirId, // L'ID de l'assignation doit être en deuxième argument
          {
            populate: ["devoir"], // Les options de population sont en troisième argument
          }
        );

        const devoir = await strapi.entityService.findOne(
          "api::devoir.devoir",
          assignation.devoir.id
        );
        // Get the student ID from the authenticated user
        const etudiantId = ctx.state.user.id;

        // Ensure attachments are provided and valid
        if (!Array.isArray(attachement) || attachement.length === 0) {
          return ctx.throw(
            400,
            "Les attachements doivent être un tableau contenant au moins un élément."
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
                console.warn(`ID d'attachement invalide: ${attachId}`);
                return null;
              }
            } catch (error) {
              console.error(
                `Erreur lors de la récupération du fichier avec l'ID ${attachId}:`,
                error
              );
              return null;
            }
          })
        );

        // Filter valid attachments
        const filteredAttachments = validAttachments.filter(
          (id) => id !== null
        );

        if (filteredAttachments.length === 0) {
          return ctx.throw(400, "Aucun ID d'attachement valide fourni.");
        }

        // Vérifier si l'étudiant est assigné à ce devoir
        // const assignation = await strapi.db
        //   .query("api::assignation.assignation")
        //   .findOne({
        //     where: {
        //       etudiant: etudiantId,
        //       devoir: { id: Number(devoirId) },
        //     },
        //   });

        // Check if an `ReponseEtudiant` already exists for this student and assignation
        let reponseEtudiant = await strapi.db
          .query("api::reponse-etudiant.reponse-etudiant")
          .findOne({
            where: {
              etudiant: etudiantId,
              assignation: assignation.id,
            },
          });

        if (reponseEtudiant) {
          // Update the existing `ReponseEtudiant`
          reponseEtudiant = await strapi.db
            .query("api::reponse-etudiant.reponse-etudiant")
            .update({
              where: { id: reponseEtudiant.id },
              data: {
                reponse,
                attachement: filteredAttachments,
                updatedAt: new Date(),
              },
            });

          ctx.send({
            message: "Réponse de l'étudiant mise à jour avec succès",
            data: reponseEtudiant,
          });
        } else {
          // Create a new `ReponseEtudiant`
          const createData = {
            reponse,
            etudiant: etudiantId,
            assignation: assignation.id, // Link to the assignation
            attachement: filteredAttachments,
            createdAt: new Date(),
          };

          const newReponseEtudiant = await strapi.db
            .query("api::reponse-etudiant.reponse-etudiant")
            .create({
              data: createData,
            });

          // Fetch the newly created entry with relations populated
          const reponseEtudiantWithRelations =
            await strapi.entityService.findOne(
              "api::reponse-etudiant.reponse-etudiant",
              newReponseEtudiant.id,
              {
                populate: ["attachement", "etudiant", "assignation"],
              }
            );

          ctx.send({
            message: "Réponse de l'étudiant créée avec succès",
            data: reponseEtudiantWithRelations,
          });
        }
      } catch (error) {
        console.error(
          "Erreur lors du traitement de la réponse de l'étudiant:",
          error
        );
        ctx.throw(500, "Erreur lors du traitement de la réponse de l'étudiant");
      }
    },
    async checkDevoir(ctx) {
      try {
        const { devoirId } = ctx.query;
        const etudiantId = ctx.state.user.id;

        // console.log("====================================");
        // console.log("ctx.query");
        // console.log(ctx.query);
        // console.log("====================================");

        // console.log("====================================");

        // console.log("ctx.state.user.id");

        // console.log(ctx.state.user.id);
        // console.log("====================================");
        // Vérifier si l'étudiant est assigné à ce devoir
        const assignation = await strapi.db
          .query("api::assignation.assignation")
          .findOne({
            where: {
              etudiant: etudiantId,
              devoir: { id: Number(devoirId) },
            },
          });

        if (!assignation) {
          return ctx.send({
            update: false,
            message: "L'étudiant n'est pas assigné à ce devoir",
          });
        }

        if (assignation.score) {
          // Mettre à jour le devoir ou effectuer d'autres opérations si nécessaire
          return ctx.send({
            update: true,
            message: "Un score existe pour cet étudiant et ce devoir",
          });
        } else {
          // Retourner false si le score n'existe pas
          return ctx.send({
            update: false,
            message: "Aucun score trouvé pour cet étudiant et ce devoir",
          });
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du devoir:", error);
        ctx.throw(500, "Erreur interne du serveur");
      }
    },

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
              "reponse_etudiants",
            ],
          });

        // Filtrer les assignations qui ont des reponse_etudiants
        const filteredAssignations = assignations.filter(
          (assignation) => assignation.reponse_etudiants.length > 0
        );

        // Structure de réponse avec les informations de l'étudiant et des reponse_etudiants
        const response = [];

        for (const assignation of filteredAssignations) {
          const assignationDetails = {
            assignationId: assignation.id,
            etudiant: assignation.etudiant.username, // Nom de l'étudiant
            devoir: assignation.devoir.titre, // Titre du devoir
            note: assignation.score,
            reponse_etudiants: [],
          };

          // Parcourir chaque reponse_etudiant associé à l'assignation
          for (const history of assignation.reponse_etudiants) {
            // Récupérer les informations de chaque reponse_etudiant
            const populatedHistory = await strapi.db
              .query("api::reponse-etudiant.reponse-etudiant")
              .findOne({
                where: { id: history.id },
                populate: ["attachement"], // Assurez-vous que les attachements sont bien peuplés
              });

            assignationDetails.reponse_etudiants.push({
              reponse: populatedHistory.reponse, // Réponse
              attachements: populatedHistory.attachement, // Attachements (images)
            });
          }

          response.push(assignationDetails);
        }

        ctx.send(response);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des réponses filtrées:",
          error
        );
        ctx.throw(500, "Erreur interne du serveur");
      }
    },
  })
);
