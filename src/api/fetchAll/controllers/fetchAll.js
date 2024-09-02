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
  async getIdOfConverstation(ctx) {
    try {
      const { etudiantId } = ctx.query; // ID de l'utilisateur (étudiant) passé dans l'URL
      const loggedInUserId = ctx.state.user.id; // ID de l'utilisateur connecté (extrait du token)

      console.log("====================================");
      console.log(etudiantId);
      console.log("====================================");
      // Cherche toutes les conversations où les deux utilisateurs sont participants
      // Cherche les conversations où les deux utilisateurs sont participants
      const conversations = await strapi.db
        .query("api::conversation.conversation")
        .findMany({
          where: {
            participants: {
              id: loggedInUserId, // L'utilisateur connecté est un participant
            },
          },
          populate: {
            participants: true, // On s'assure de peupler les participants pour les vérifier
          },
        });

      // Filtrer les conversations pour s'assurer que l'étudiant est bien dans la même conversation
      const validConversation = conversations.find((conversation) =>
        conversation.participants.some(
          (participant) => participant.id.toString() === etudiantId
        )
      );

      if (!validConversation) {
        return ctx.throw(404, "No common conversation found for these users");
      }

      // Renvoyer l'ID de la conversation valide trouvée
      const conversationId = validConversation.id;

      ctx.send({ conversationId });
    } catch (err) {
      ctx.throw(500, err);
    }
  },
};

// "use strict";

// module.exports = {
//   async findAllData(ctx) {
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
