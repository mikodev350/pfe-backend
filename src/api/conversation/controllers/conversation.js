"use strict";

/**
 * conversation controller
 */

module.exports = ({ strapi }) => ({
  async findConversations(ctx) {
    const user = ctx.state.user;
    const conversations = await strapi.db
      .query("api::conversation.conversation")
      .findMany({
        where: {
          participants: {
            $contains: [user.id],
          },
        },
        populate: {
          participants: {
            select: ["id", "username", "type"],
            populate: {
              profil: {
                select: ["id"],
                populate: {
                  photoProfil: {
                    select: ["url"],
                  },
                },
              },
            },
          },
        },
      });
    return { currentUserId: user.id, conversations };
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
        },
        populate: {
          participants: {
            select: ["id", "username", "type"],
            populate: {
              profil: {
                select: ["id"],
                populate: {
                  photoProfil: {
                    select: ["url"],
                  },
                },
              },
            },
          },
          messages: {
            populate: {
              expediteur: {
                select: ["id", "username", "type"],
                populate: {
                  profil: {
                    select: ["id"],
                    populate: {
                      photoProfil: {
                        select: ["url"],
                      },
                    },
                  },
                },
              },
              attachement: true,
            },
          },
        },
      });
    console.log("conversation" + conversation);
    if (!conversation) {
      ctx.notFound({ msg: "Conversation not found" });
    }
    return { ...conversation, currentUserId: user.id };
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
  //create new message
  async createMessage(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.request.params;
    console.log(ctx.request.body);
    const conversation = await strapi.db
      .query("api::conversation.conversation")
      .findOne({
        where: {
          participants: {
            $contains: [user.id],
          },
          id: id,
        },
        populate: {
          participants: {
            select: ["id"],
          },
        },
      });

    if (!conversation) {
      ctx.notFound({ msg: "Conversation not found" });
    }

    console.log(strapi.usersSockets);
    const {
      data: { message = "", type, fakeId, file },
    } = ctx.request.body;
    let newMessage = {};
    if (type === "TEXT") {
      const result = await strapi.db.query("api::message.message").create({
        data: {
          contenu: message,
          expediteur: ctx.state.user,
          conversation: id,
        },
      });
      newMessage = result;
    } else if (type === "VOICE" || type === "FILES" || type === "IMAGES") {
      const result = await strapi.db.query("api::message.message").create({
        data: {
          attachement: file,
          expediteur: ctx.state.user,
          conversation: id,
        },
      });
      newMessage = result;
    }
    console.log(conversation);
    const messageAdded = await strapi.db.query("api::message.message").findOne({
      where: {
        id: newMessage.id,
      },
      populate: {
        participants: {
          select: ["id", "username", "type"],
          populate: {
            profil: {
              select: ["id"],
              populate: {
                photoProfil: {
                  select: ["url"],
                },
              },
            },
          },
        },
        attachement: true,
      },
    });
    for (let user of conversation.participants) {
      const userId = user.id;
      const socketIds = strapi.usersSockets[userId];
      if (socketIds && socketIds.length > 0 && userId !== ctx.state.user.id) {
        strapi.io.to(socketIds).emit("newMessage", { message: messageAdded });
      }
    }
    return { fakeId };
  },
});
