"use strict";

const profil = require("../../profil/controllers/profil");

const STUDENT = "STUDENT";
const TEACHER = "TEACHER";

const COACHING = "COACHING";
const AMIS = "AMIS";

module.exports = ({ strapi }) => ({
  async createFriendsRelation(ctx) {
    try {
      const { recipientId, typeDemande } = ctx.request.body; // Récupérer typeDemande depuis le corps de la requête

      const user = ctx.state.user;
      const recipient = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({ where: { id: recipientId } });

      if (!recipient) return ctx.badRequest("Recipient does not exist");

      const type = typeDemande || (await findTypeRelation(user, recipient));

      await strapi.db.query("api::relation.relation").create({
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
            redirect_url: "/communaute",
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
    const { recipientId: id } = ctx.request.body;
    const user = ctx.state.user;

    await strapi.db.query("api::relation.relation").update({
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
      data: { status: "acceptée" },
    });

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

    console.log("THE CONVERSATION ");
    console.log("conversationExist ");
    console.log(conversationExist);

    if (!conversationExist) {
      await strapi.db.query("api::conversation.conversation").create({
        data: {
          participants: [user.id, id],
          type: "PRIVATE",
        },
      });
    }

    return ctx.send({ msg: "Request accepted successfully" });
  },

  async declineRelation(ctx) {
    const { id } = ctx.request.params;
    const user = ctx.state.user;

    await strapi.db.query("api::relation.relation").delete({
      where: {
        $or: [
          {
            destinataire: user,
            expediteur: { id },
          },
          {
            expediteur: user,
            destinataire: { id },
          },
        ],
      },
    });

    return ctx.send({ msg: "Request declined successfully" });
  },

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
});

function findTypeRelation(userOne, userTwo) {
  console.log("--------------------------");

  console.log(userOne);
  console.log(userTwo);
  console.log("--------------------------");

  return (userOne.type === STUDENT && userTwo.type === STUDENT) ||
    (userOne.type === TEACHER && userTwo.role === TEACHER)
    ? AMIS
    : COACHING;
}
