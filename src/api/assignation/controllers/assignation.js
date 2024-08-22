"use strict";

/**
 * assignation controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const formatDate = (date) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return new Date(date).toLocaleDateString("fr-FR", options);
};
module.exports = createCoreController(
  "api::assignation.assignation",
  ({ strapi }) => ({
    async create(ctx) {
      try {
        const { entityId, userIds, type, assignments, TypeOfasssignation } =
          ctx.request.body;
        const professeur = ctx.state.user.id;

        let createdAssignations = [];

        if (type === "GROUP") {
          // Boucle sur chaque étudiant
          for (const etudiant of userIds) {
            // Boucle sur chaque assignment si c'est un tableau
            for (const assignment of assignments) {
              const createData = {
                etudiant: etudiant,
                professeur: professeur,
                devoir: TypeOfasssignation === "DEVOIR" ? assignment : null,
                quiz: TypeOfasssignation === "QUIZ" ? assignment : null,
                group: entityId,
                createdAt: new Date(),
              };

              // Créer l'assignation pour l'étudiant et l'assignation courants
              const createdAssignation = await strapi.entityService.create(
                "api::assignation.assignation",
                {
                  data: createData,
                }
              );

              createdAssignations.push(createdAssignation);

              // Créer une notification pour l'étudiant
              const notification = await strapi.db
                .query("api::notification.notification")
                .create({
                  data: {
                    destinataire: etudiant,
                    expediteur: professeur,
                    notifText: `Nouvelle assignation ${TypeOfasssignation}`,
                    redirect_url: "/student/assignments",
                  },
                });

              // Envoyer la notification via WebSocket
              const socketIds = strapi.usersSockets[etudiant];
              if (socketIds && socketIds.length) {
                strapi.io.to(socketIds).emit("notification", {
                  notification: { ...notification, expediteur: ctx.state.user },
                });
              }
            }
          }
        } else if (type === "INDIVIDUEL") {
          for (const etudiant of userIds) {
            for (const assignment of assignments) {
              const createData = {
                etudiant: etudiant,
                professeur: professeur,
                devoir: TypeOfasssignation === "DEVOIR" ? assignment : null,
                quiz: TypeOfasssignation === "QUIZ" ? assignment : null,
                createdAt: new Date(),
              };

              // Créer l'assignation pour l'étudiant et l'assignation courants
              const createdAssignation = await strapi.entityService.create(
                "api::assignation.assignation",
                {
                  data: createData,
                }
              );

              createdAssignations.push(createdAssignation);

              // Créer une notification pour l'étudiant
              const notification = await strapi.db
                .query("api::notification.notification")
                .create({
                  data: {
                    destinataire: etudiant,
                    expediteur: professeur,
                    notifText: `Nouvelle assignation ${TypeOfasssignation}`,
                    redirect_url: "/assignations",
                  },
                });

              // Envoyer la notification via WebSocket
              const socketIds = strapi.usersSockets[etudiant];
              if (socketIds && socketIds.length) {
                strapi.io.to(socketIds).emit("notification", {
                  notification: { ...notification, expediteur: ctx.state.user },
                });
              }
            }
          }
        }

        ctx.send({
          message: "Assignations créées avec succès",
          assignations: createdAssignations,
        });
      } catch (error) {
        console.error("Erreur lors de la création des assignations:", error);
        ctx.throw(500, "Erreur lors de la création des assignations");
      }
    },
    async find(ctx) {
      try {
        const { type, group, TypeElement } = ctx.query;
        const professeur = ctx.state.user.id;
        const groupId = Number(group);

        let filters = {
          professeur: professeur,
        };

        // Filtrer en fonction du groupe ou de l'étudiant
        if (group && TypeElement === "GROUP") {
          filters.group = groupId;
        } else if (group && TypeElement === "INDIVIDUEL") {
          filters.etudiant = { id: groupId };
        }

        // Filtrer en fonction du type (DEVOIR ou QUIZ)
        if (type === "DEVOIR") {
          filters.devoir = { $notNull: true };
          filters.quiz = { $null: true };
        } else if (type === "QUIZ") {
          filters.quiz = { $notNull: true };
          filters.devoir = { $null: true };
        }

        console.log(
          "----------------------------------------------------------------------"
        );
        console.log("filters");
        console.log(filters);
        console.log(
          "----------------------------------------------------------------------"
        );

        // Récupérer les assignations avec les filtres appliqués
        const assignations = await strapi.entityService.findMany(
          "api::assignation.assignation",
          {
            populate: ["devoir", "quiz", "etudiant", "professeur", "group"],
            filters: filters,
          }
        );

        let transformedData;

        if (TypeElement === "GROUP") {
          // Utiliser un Map pour stocker les assignations uniques par groupe
          const uniqueAssignmentsMap = new Map();

          assignations.forEach((assignation) => {
            let titre = "Titre non disponible";
            let devoirIdElement = null;

            if (type === "DEVOIR" && assignation.devoir) {
              titre = assignation.devoir.titre;
              devoirIdElement = assignation.devoir.id;
            } else if (type === "QUIZ" && assignation.quiz) {
              titre = assignation.quiz.titre;
            }

            // Vérifier si l'assignation est déjà présente pour le groupe
            const key = `${assignation.group?.id}-${titre}`;
            if (!uniqueAssignmentsMap.has(key)) {
              uniqueAssignmentsMap.set(key, {
                id: assignation.id,
                titre: titre,
                date: formatDate(assignation.createdAt),
                groupeId: assignation.group ? assignation.group?.id : null,
                devoirId: devoirIdElement,
              });
            }
          });

          // Convertir le Map en tableau pour l'envoyer dans la réponse
          transformedData = Array.from(uniqueAssignmentsMap.values());
        } else {
          // Si c'est un type individuel, simplement transformer les données sans filtrer les répétitions
          transformedData = assignations.map((assignation) => {
            let titre = "Titre non disponible";
            let devoirIdElement = null;

            if (type === "DEVOIR" && assignation.devoir) {
              titre = assignation.devoir.titre;
              devoirIdElement = assignation.devoir.id;
            } else if (type === "QUIZ" && assignation.quiz) {
              titre = assignation.quiz.titre;
            }

            return {
              id: assignation.id,
              titre: titre,
              date: formatDate(assignation.createdAt),
              groupeId: TypeElement === "GROUP" ? assignation.group?.id : null,
              devoirId: devoirIdElement,
            };
          });
        }

        console.log("====================================");
        console.log("transformedData");
        console.log(transformedData);
        console.log("====================================");

        // Envoyer les données transformées
        ctx.send(transformedData);
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

    async delete(ctx) {
      try {
        const { id } = ctx.params; // L'id du devoir ou du quiz
        const { groupId, TypeElement, type } = ctx.query; // L'id du groupe ou de l'individu, le TypeElement (GROUP/INDIVIDUEL), et le type (DEVOIR/QUIZ)
        const professeur = ctx.state.user.id;

        console.log("------------------------------------------------");
        console.log("ctx.query");
        console.log(ctx.query);
        console.log("------------------------------------------------");

        // Construire les filtres pour la suppression
        let filters = {
          professeur: professeur,
        };

        // Filtrer en fonction du groupe ou de l'étudiant
        if (TypeElement === "GROUP") {
          filters.group = groupId;
        } else if (TypeElement === "INDIVIDUEL") {
          filters.etudiant = groupId; // groupId est utilisé ici pour l'id de l'étudiant dans le cas INDIVIDUEL
        }

        // Filtrer en fonction du type (DEVOIR ou QUIZ) et de l'id spécifique
        if (type === "DEVOIR") {
          filters.devoir = id;
        } else if (type === "QUIZ") {
          filters.quiz = id;
        }

        // Rechercher les assignations à supprimer en utilisant les filtres construits
        const assignationsToDelete = await strapi.entityService.findMany(
          "api::assignation.assignation",
          {
            filters: filters,
          }
        );

        // Si on trouve des assignations, on les supprime
        if (assignationsToDelete.length > 0) {
          for (const assignation of assignationsToDelete) {
            await strapi.entityService.delete(
              "api::assignation.assignation",
              assignation.id
            );
          }
          ctx.send({
            message: `${assignationsToDelete.length} assignations supprimées avec succès`,
          });
        } else {
          ctx.send({ message: "Aucune assignation trouvée à supprimer" });
        }
      } catch (error) {
        console.error("Erreur lors de la suppression des assignations:", error);
        ctx.throw(500, "Erreur lors de la suppression des assignations");
      }
    },
  })
);
