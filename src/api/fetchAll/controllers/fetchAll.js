"use strict";

module.exports = {
  async findAllData(ctx) {
    try {
      const { _q = "" } = ctx.query;
      const userId = ctx.state.user.id;

      const where = {
        users_permissions_user: {
          id: userId,
        },
      };

      if (_q) {
        where.nom = { $contains: _q };
      }

      // Fetching all parcours without pagination
      const parcours = await strapi.db.query("api::parcour.parcour").findMany({
        where,
        populate: {
          modules: {
            populate: {
              lessons: true,
            },
          },
        },
      });

      if (!parcours || !Array.isArray(parcours)) {
        throw new Error("Parcours data is invalid or not an array");
      }

      // Fetching all resources without pagination
      const resources = await strapi.db
        .query("api::resource.resource")
        .findMany({
          where,
          populate: [
            "parcours",
            "modules",
            "lessons",
            "images",
            "audio",
            "pdf",
            "video",
          ],
        });

      if (!resources || !Array.isArray(resources)) {
        throw new Error("Resources data is invalid or not an array");
      }

      ctx.send({
        data: {
          parcours,
          resources,
        },
        meta: {
          totalParcours: parcours.length,
          totalResources: resources.length,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      ctx.throw(
        500,
        "Une erreur est survenue lors de la récupération des données"
      );
    }
  },
  async getIdOfConversation(ctx) {
    try {
      const { etudiantId } = ctx.query; // ID de l'étudiant passé dans l'URL
      const loggedInUserId = ctx.state.user.id; // ID de l'utilisateur connecté (extrait du token)

      // Affiche les IDs pour le débogage
      console.log("ID Étudiant:", etudiantId);
      console.log("ID Utilisateur connecté:", loggedInUserId);

      // Cherche les conversations où les deux utilisateurs sont participants
      const conversations = await strapi.db
        .query("api::conversation.conversation")
        .findMany({
          where: {
            participants: {
              id: {
                $in: [loggedInUserId, etudiantId], // Vérifie que les deux utilisateurs sont participants
              },
            },
          },
          populate: {
            participants: true, // Peuple les participants pour les vérifier
          },
        });

      console.log("====================================");
      console.log("conversations");

      console.log(conversations);
      console.log("====================================");
      // Filtrer les conversations qui ont **exactement** les deux participants et personne d'autre
      const validConversation = conversations.find((conversation) => {
        const participantIds = conversation.participants.map((p) =>
          p.id.toString()
        );
        return (
          participantIds.includes(loggedInUserId.toString()) &&
          participantIds.includes(etudiantId.toString()) &&
          participantIds.length === 2 // Vérifie qu'il y a exactement 2 participants, ni plus ni moins
        );
      });

      if (!validConversation) {
        return ctx.throw(
          404,
          "Aucune conversation commune trouvée pour ces deux utilisateurs"
        );
      }

      // Renvoyer l'ID de la conversation valide trouvée
      const conversationId = validConversation.id;

      // Retourne l'ID de la conversation trouvée
      ctx.send({ conversationId });
    } catch (err) {
      // Gérer les erreurs et renvoyer une réponse appropriée
      console.error(
        "Erreur lors de la récupération de l'ID de la conversation :",
        err
      );
      ctx.throw(
        500,
        "Une erreur est survenue lors de la récupération de la conversation"
      );
    }
  },
};

// "use strict";

// module.exports = {
//   async findAllgetIdOfConverstationData(ctx) {
//     try {
//       const { _page = 1, _limit = 5, _q = "" } = ctx.query;
//       const page = parseInt(_page, 10);
//       const limit = parseInt(_limit, 10);
//       const etudiantId = ctx.state.user.id;

//       const where = {
//         users_permissions_user: {
//           id: userId,
//         },
//       };

//       if (_q) {
//         where.nom = { $contains: _q };
//       }

//       // Fetching parcours
//       const [parcours, totalParcours] = await Promise.all([
//         strapi.db.query("api::parcour.parcour").findMany({
//           where,
//           start: (page - 1) * limit,
//           limit,
//           populate: {
//             modules: {
//               populate: {
//                 lessons: true,
//               },
//             },
//           },
//         }),
//         strapi.db.query("api::parcour.parcour").count({ where }),
//       ]);

//       if (!parcours || !Array.isArray(parcours)) {
//         throw new Error("Parcours data is invalid or not an array");
//       }

//       // Fetching resources
//       const [resources, totalResources] = await Promise.all([
//         strapi.db.query("api::resource.resource").findMany({
//           where,
//           start: (page - 1) * limit,
//           limit,
//           populate: [
//             "parcours",
//             "modules",
//             "lessons",
//             "images",
//             "audio",
//             "pdf",
//             "video",
//           ],
//         }),
//         strapi.db.query("api::resource.resource").count({ where }),
//       ]);

//       if (!resources || !Array.isArray(resources)) {
//         throw new Error("Resources data is invalid or not an array");
//       }

//       const totalPagesParcours = Math.ceil(totalParcours / limit);
//       const totalPagesResources = Math.ceil(totalResources / limit);

//       ctx.send({
//         data: {
//           parcours,
//           resources,
//         },
//         meta: {
//           pagination: {
//             parcours: {
//               page,
//               pageSize: limit,
//               pageCount: totalPagesParcours,
//               total: totalParcours,
//             },
//             resources: {
//               page,
//               pageSize: limit,
//               pageCount: totalPagesResources,
//               total: totalResources,
//             },
//           },
//         },
//       });
//     } catch (error) {
//       console.error("Erreur lors de la récupération des données:", error);
//       ctx.throw(
//         500,
//         "Une erreur est survenue lors de la récupération des données"
//       );
//     }
//   },
// };
