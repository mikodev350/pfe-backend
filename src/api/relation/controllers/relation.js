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
    const { receiverId } = ctx.request.body;
    const user = ctx.state.user;
    const receiver = await strapi
      .query("plugin::users-permissions.role")
      .findOne({ where: { id: receiverId } });
    if (!receiver) return ctx.badRequest("Role does not exist");
    const type = findTypeRelation(user, receiver);
    // Check the receiverId if is a teacher or a student
    await strapi.db.create({
      data: {
        destinataire: receiver,
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
      .query("plugin::users-permissions.role")
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
