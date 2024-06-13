"use strict";

const STUDENT = "STUDENT";
const COATCH = "COATCH";
const PROFESIONAL = "PROFESIONAL";
const FRIEND = "FRIEND";
/**
 * relation controller
 */

module.exports = ({ strapi }) => ({
  async createFriendsRelation(ctx) {
    const { recipientId } = ctx.request.body;
    const user = ctx.state.user;
    const recipient = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: recipientId } });
    console.log(recipient);
    if (!recipient) return ctx.badRequest("Role does not exist");
    const type = findTypeRelation(user, recipient);
    // Check the receiverId if is a teacher or a student
    await strapi.db.query("api::relation.relation").create({
      data: {
        destinataire: recipient,
        expediteur: user,
        type: type,
      },
    });
    return ctx.send({ msg: "successed" });
  },
  async acceptRelation(ctx) {
    const { recipientId: id } = ctx.request.body;
    const user = ctx.state.user;
    await strapi.db.query("api::relation.relation").update({
      where: {
        $or: [
          {
            destinataire: user,
            expediteur: {
              id,
            },
          },
          {
            expediteur: user,
            destinataire: {
              id,
            },
          },
        ],
      },
      data: {
        status: "acceptée",
      },
    });

    // Create conversation
    await strapi.db.query("api::conversation.conversation").create({
      data: {
        participants: [user.id, id],
        type: "PRIVATE",
      },
    });
    return ctx.send({ msg: "successed" });
  },
  async declineRelation(ctx) {
    const { id } = ctx.request.params;
    const user = ctx.state.user;

    await strapi.db.query("api::relation.relation").delete({
      where: {
        $or: [
          {
            destinataire: user,
            expediteur: {
              id,
            },
          },
          {
            expediteur: user,
            destinataire: {
              id,
            },
          },
        ],
      },
    });

    return ctx.send({ msg: "DELETED" });
  },
  async findPendingRelation(ctx) {
    const user = ctx.state.user;
    const invitations = await strapi.db
      .query("api::relation.relation")
      .findMany({
        where: {
          destinataire: user,
        },
        populate: {
          expediteur: {
            select: ["id", "username", "type", "email"],
            populate: {
              profil: {
                populate: {
                  photoProfil: true,
                },
              },
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
