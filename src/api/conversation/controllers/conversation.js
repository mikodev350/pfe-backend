"use strict";

/**
 * conversation controller
 */

module.exports = ({ strapi }) => ({
  async findConversations(ctx) {
    const user = ctx.state.user;
    const conversations = await strapi.db
      .query("api::conversation.conversation")
      .findOne({
        where: {
          participants: {
            $contains: [user.id],
          },
        },
      });
    return conversations;
  },
  async findOneByUserId(ctx) {
    const user = ctx.state.user;
    const { userId } = ctx.request.params;
    const conversation = await strapi.db
      .query("api::conversation.conversation")
      .findOne({
        where: {
          participants: {
            $contains: [user.id, userId],
          },
          type: "PRIVATE",
        },
        populate: {
          participants: {
            select: ["id", "username", "type"],
            populate: {
              profil: {
                select: ["photoProfil"],
              },
            },
          },
          messages: {
            populate: {
              expediteur: {
                select: ["id", "username", "type"],
                populate: {
                  profil: {
                    select: ["photoProfil"],
                  },
                },
              },
              attachement: true,
            },
          },
        },
      });
    return conversation;
  },
  async findOne(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.request.params;
    const conversation = await strapi.db
      .query("api::conversation.conversation")
      .findOne({
        where: {
          participants: {
            $contains: [user.id],
          },
          id: id,
          type: "PRIVATE",
        },
        populate: {
          participants: {
            select: ["id", "username", "type"],
            populate: {
              profil: {
                select: ["photoProfil"],
              },
            },
          },
          messages: {
            populate: {
              expediteur: {
                select: ["id", "username", "type"],
                populate: {
                  profil: {
                    select: ["photoProfil"],
                  },
                },
              },
              attachement: true,
            },
          },
        },
      });
    return conversation;
  },
  async findConversationId(ctx) {
    const user = ctx.state.user;
    const { userId } = ctx.request.query;
    const conversation = await strapi.db
      .query("api::conversation.conversation")
      .findOne({
        select: ["id"],
        where: {
          participants: {
            $contains: [user.id, userId],
          },
          type: "PRIVATE",
        },
      });
    return conversation;
  },
});
