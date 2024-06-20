"use strict";

const STUDENT = "STUDENT";
const COATCH = "COATCH";
const PROFESIONAL = "PROFESIONAL";
const FRIEND = "FRIEND";

module.exports = ({ strapi }) => ({
  async createFriendsRelation(ctx) {
    const { recipientId } = ctx.request.body;
    const user = ctx.state.user;
    const recipient = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: recipientId } });
    if (!recipient) return ctx.badRequest("Recipient does not exist");

    const type = findTypeRelation(user, recipient);

    await strapi.db.query("api::relation.relation").create({
      data: {
        destinataire: recipient,
        expediteur: user,
        type: type,
      },
    });

    return ctx.send({ msg: "Request sent successfully" });
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
    const user = ctx.state.user;
    const invitations = await strapi.db
      .query("api::relation.relation")
      .findMany({
        where: { destinataire: user },
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
  },
});

function findTypeRelation(userOne, userTwo) {
  return userOne.type === STUDENT && userTwo.role === STUDENT
    ? FRIEND
    : PROFESIONAL;
}
