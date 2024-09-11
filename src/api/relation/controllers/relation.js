"use strict";

const STUDENT = "STUDENT";
const TEACHER = "TEACHER";

const COACHING = "COACHING";
const AMIS = "AMIS";
const MENTORAT = "MENTORAT";

module.exports = ({ strapi }) => ({
  async createFriendsRelation(ctx) {
    try {
      const { recipientId, typeDemande } = ctx.request.body; // Récupérer typeDemande depuis le corps de la requête

      const user = ctx.state.user;
      const recipient = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({ where: { id: recipientId } });

      if (!recipient) return ctx.badRequest("Recipient does not exist");

      const type = typeDemande || findTypeRelation(user, recipient);

      const Relation = await strapi.db.query("api::relation.relation").create({
        data: {
          destinataire: recipient.id,
          expediteur: user.id,
          type: type,
        },
      });

      const notification = await strapi.db
        .query("api::notification.notification")
        .create({
          data: {
            destinataire: recipient.id,
            expediteur: user.id,
            notifText: "te demande de l'accepter",
            redirect_url:
              Relation.type === COACHING
                ? "/communaute/coaching"
                : "/communaute/invitations",
          },
        });

      const socketIds = strapi.usersSockets[recipient.id];
      if (socketIds && socketIds.length) {
        strapi.io.to(socketIds).emit("notification", {
          notification: { ...notification, expediteur: user },
        });
      }
      return ctx.send({ msg: "successed" });
    } catch (error) {
      console.error("Error creating relation:", error);
      return ctx.internalServerError("Failed to create relation.");
    }
  },

  async acceptRelation(ctx) {
    try {
      const { recipientId: id } = ctx.request.body;
      const user = ctx.state.user;

      // Récupérer la relation existante avec expéditeur et destinataire peuplés
      const existingRelation = await strapi.db
        .query("api::relation.relation")
        .findOne({
          where: {
            $or: [
              { destinataire: user.id, expediteur: id },
              { expediteur: user.id, destinataire: id },
            ],
          },
          populate: ["expediteur", "destinataire"],
        });

      // Vérifier si la relation existe
      if (!existingRelation) {
        return ctx.throw(404, "Relation non trouvée");
      }

      // Inverser les rôles si l'expéditeur est un enseignant et le destinataire est un étudiant
      if (
        existingRelation.expediteur.type === TEACHER &&
        existingRelation.destinataire.type === STUDENT
      ) {
        // Mettre à jour la relation avec les rôles inversés et le type à MENTORAT
        await strapi.db.query("api::relation.relation").update({
          where: { id: existingRelation.id },
          data: {
            expediteur: existingRelation.destinataire.id,
            destinataire: existingRelation.expediteur.id,
            type: COACHING,
            status: "acceptée",
          },
        });
      } else {
        // Accepter la relation normalement
        await strapi.db.query("api::relation.relation").update({
          where: { id: existingRelation.id },
          data: { status: "acceptée" },
        });
      }

      // Vérifier si une conversation privée existe déjà entre les deux utilisateurs
      const conversationExist = await strapi.db
        .query("api::conversation.conversation")
        .findOne({
          populate: ["participants"],
          where: {
            type: "PRIVATE",
            participants: {
              $and: [{ id: user.id }, { id: id }],
            },
          },
        });

      // Créer une conversation privée si elle n'existe pas
      if (!conversationExist) {
        const newConvesration = await strapi.db
          .query("api::conversation.conversation")
          .create({
            data: {
              participants: [user.id, id],
              type: "PRIVATE",
            },
          });
        const relation = await strapi.db
          .query("api::relation.relation")
          .update({
            where: { id: existingRelation.id },
            data: { status: "acceptée", conversation: newConvesration.id },
          });

        /******************************************************************************************************/
        console.log("====================================");
        console.log("relation");
        console.log(relation);
        console.log("====================================");

        /***********************************************************************************************************/
        // Créer une notification pour l'expéditeur (celui qui a envoyé l'invitation)
        const notificationForSender = await strapi.db
          .query("api::notification.notification")
          .create({
            data: {
              destinataire: existingRelation.expediteur.id,
              expediteur: user.id,
              notifText: ` a accepté votre 
               demande d'${relation.type.toLowerCase()}`,
              type: "NOTIFICATION",
            },
          });

        // Envoyer la notification via WebSocket à l'expéditeur
        const socketIdsSender =
          strapi.usersSockets[existingRelation.expediteur.id];
        if (socketIdsSender && socketIdsSender.length) {
          strapi.io.to(socketIdsSender).emit("notification", {
            notification: {
              ...notificationForSender,
              expediteur: ctx.state.user,
            },
          });
        }
      }

      return ctx.send({ msg: "Demande acceptée avec succès" });
    } catch (error) {
      console.error("Erreur lors de l'acceptation de la relation:", error);
      ctx.throw(500, "Erreur lors de l'acceptation de la relation");
    }
  },
  /*********************************************************************************************/

  async declineRelation(ctx) {
    const { id } = ctx.request.params; // ID de l'utilisateur dont la relation doit être supprimée
    const user = ctx.state.user; // Utilisateur courant

    try {
      // Trouver la relation à supprimer
      const relation = await strapi.db.query("api::relation.relation").findOne({
        where: {
          $or: [
            {
              destinataire: user.id,
              expediteur: id,
            },
            {
              expediteur: user.id,
              destinataire: id,
            },
          ],
        },
        populate: ["conversation"],
      });

      // Vérifier si la relation existe
      if (!relation) {
        return ctx.throw(404, "Relation non trouvée");
      }

      // Vérifier si le statut de la relation est "acceptée"
      if (relation.status === "attente") {
        // Créer une notification indiquant le refus de la relation
        const notification = await strapi.db
          .query("api::notification.notification")
          .create({
            data: {
              destinataire: id, // L'autre utilisateur (expéditeur ou destinataire selon le cas)
              expediteur: user.id, // Utilisateur actuel
              notifText: ` a refusé la demande ${relation.type.toLowerCase()}`,
              type: "NOTIFICATION",
            },
          });

        // Envoyer la notification via WebSocket
        const socketIds = strapi.usersSockets[id];
        if (socketIds && socketIds.length) {
          strapi.io.to(socketIds).emit("notification", {
            notification: { ...notification, expediteur: ctx.state.user },
          });
        }
      }

      // Vérifier si la relation a une conversation associée
      if (relation.conversation && relation.conversation.id) {
        // Supprimer la conversation
        await strapi.db.query("api::conversation.conversation").delete({
          where: { id: relation.conversation.id },
        });
      }

      // Supprimer la relation
      await strapi.db.query("api::relation.relation").delete({
        where: { id: relation.id },
      });

      return ctx.send({
        msg: relation.conversation
          ? "Relation et conversation supprimées avec succès"
          : "Relation supprimée avec succès, aucune conversation existante",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de la relation:", error);
      return ctx.internalServerError(
        "Erreur lors de la suppression de la relation"
      );
    }
  },

  /*********************************************************************************************/
  async findPendingRelation(ctx) {
    try {
      const user = ctx.state.user;
      const { type } = ctx.query; // Récupère le type de relation à partir des paramètres de la requête

      // Construire la condition de filtrage en fonction du type
      const conditions = {
        destinataire: user.id,
        status: "attente",
      };

      if (type) {
        conditions.type = type; // Ajouter le filtre par type si spécifié
      }

      const invitations = await strapi.db
        .query("api::relation.relation")
        .findMany({
          where: conditions,
          populate: {
            expediteur: {
              select: ["id", "username", "type", "email"],
              populate: {
                profil: { populate: { photoProfil: true } },
              },
            },
          },
        });

      return invitations;
    } catch (error) {
      ctx.throw(
        500,
        "Une erreur est survenue lors de la récupération des relations en attente"
      );
    }
  },

  async findAcceptedRelations(ctx) {
    try {
      const user = ctx.state.user;
      const { type } = ctx.query;

      // Construire la condition de filtrage
      const conditions = {
        expediteur: user.id, // Filtrer par l'utilisateur comme expéditeur
        status: "acceptée", // Status de la relation acceptée
      };

      if (type) {
        conditions.type = type; // Ajouter le filtre par type si spécifié
      }

      const relations = await strapi.db
        .query("api::relation.relation")
        .findMany({
          where: conditions,
          populate: {
            destinataire: {
              select: ["id", "username", "type", "email"],
              populate: {
                profil: { populate: { photoProfil: true } },
              },
            },
          },
        });

      return ctx.send(relations);
    } catch (error) {
      console.error("Error fetching accepted relations:", error);
      ctx.throw(
        500,
        "Une erreur est survenue lors de la récupération des relations acceptées"
      );
    }
  },

  async findRelationFriends(ctx) {
    try {
      const user = ctx.state.user; // Utilisateur actuellement connecté

      // Trouver toutes les relations d'amitié (AMIS) pour cet utilisateur
      const relations = await strapi.db
        .query("api::relation.relation")
        .findMany({
          where: {
            type: "AMIS", // Filtrer par type d'amitié
            status: "acceptée", // Seulement les relations acceptées
            $or: [
              { expediteur: user.id }, // L'utilisateur est l'expéditeur
              { destinataire: user.id }, // Ou l'utilisateur est le destinataire
            ],
          },
          populate: {
            expediteur: {
              select: ["id", "username", "email"], // Infos sur l'expéditeur
            },
            destinataire: {
              select: ["id", "username", "email"], // Infos sur le destinataire
            },
            conversation: true, // Assurez-vous que la conversation est bien récupérée
          },
        });

      // Filtrer les relations pour ne renvoyer que l'autre utilisateur et la conversation
      const filteredRelations = relations.map((relation) => {
        const conversationId = relation?.conversation?.id || null; // Récupérer l'ID de la conversation

        if (relation.expediteur.id === user.id) {
          // Si l'utilisateur connecté est l'expéditeur, on renvoie le destinataire et la conversation
          return {
            ...relation.destinataire, // Infos sur le destinataire
            conversationId, // Ajouter l'ID de la conversation
          };
        } else {
          // Si l'utilisateur connecté est le destinataire, on renvoie l'expéditeur et la conversation
          return {
            ...relation.expediteur, // Infos sur l'expéditeur
            conversationId, // Ajouter l'ID de la conversation
          };
        }
      });

      console.log(filteredRelations);

      // Retourner les relations filtrées avec conversationId
      return ctx.send(filteredRelations);
    } catch (error) {
      console.error("Erreur lors de la récupération des amis:", error);
      ctx.throw(500, "Erreur lors de la récupération des amis");
    }
  },
});

function findTypeRelation(userOne, userTwo) {
  return (userOne.type === STUDENT && userTwo.type === STUDENT) ||
    (userOne.type === TEACHER && userTwo.role === TEACHER)
    ? AMIS
    : COACHING;
}
