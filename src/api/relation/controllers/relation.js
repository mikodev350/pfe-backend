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
    const { expediteurId } = ctx.request.body;
    const user = ctx.state.user;
    const expediteur = await strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: expediteurId } });
    if (!expediteur) return ctx.badRequest("User donsnt exist");

    await strapi.db.update({
      where: {
        destinataire: user,
        expediteur: expediteur,
      },
      data: {
        status: "acceptée",
      },
    });
    return ctx.send({ msg: "successed" });
  },
  async declineRelation(ctx) {
    const { userTargetId } = ctx.request.body;
    const user = ctx.state.user;

    await strapi.db.delete({
      where: {
        $or: [
          {
            destinataire: user,
            expediteur: userTargetId,
          },
          {
            expediteur: user,
            destinataire: userTargetId,
          },
        ],
      },
    });
    return ctx.send({ msg: "DELETED" });
  },
});

function findTypeRelation(userOne, userTwo) {
  return userOne.type === STUDENT && userTwo.role === STUDENT
    ? FRIEND
    : PROFESIONAL;
}
