"use strict";

/**
 * conversation controller
 */

module.exports = ({ strapi }) => ({
  async findPrivateConversations(ctx) {
    const user = ctx.state.user;
    const conversations = await strapi.db
      .query("api::conversation.conversation")
      .findMany({
        where: {
          participants: {
            $contains: [user.id],
          },
          type: "PRIVATE",
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

  async findGroupConversations(ctx) {
    const user = ctx.state.user;
    const conversations = await strapi.db
      .query("api::conversation.conversation")
      .findMany({
        where: {
          participants: {
            $contains: [user.id],
          },
          type: "GROUP",
        },
        select: ["titre"],
        populate: {
          participants: {
            select: ["id", "username"],
          },
        },
      });
    console.log("====================================");
    console.log("this is groupe converstation ");
    console.log(conversations);

    console.log("====================================");
    return { currentUserId: user.id, conversations };
  },
  // async findConversations(ctx) {
  //   const user = ctx.state.user;
  //   const conversations = await strapi.db
  //     .query("api::conversation.conversation")
  //     .findMany({
  //       where: {
  //         participants: {
  //           $contains: [user.id],
  //         },
  //       },
  //       populate: {
  //         participants: {
  //           select: ["id", "username", "type"],
  //           populate: {
  //             profil: {
  //               select: ["id"],
  //               populate: {
  //                 photoProfil: {
  //                   select: ["url"],
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });
  //   console.log("====================================");
  //   console.log(conversations);
  //   console.log("====================================");
  //   return { currentUserId: user.id, conversations };
  // },
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
          admin: {
            select: ["id", "username"], // Make sure admin field is populated correctly
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
    await strapi.db.query("api::conversation.conversation").update({
      where: {
        id: conversation.id,
      },
      data: {
        users_seen_message: [],
      },
    });
    for (let user of conversation.participants) {
      const userId = user.id;
      const socketIds = strapi.usersSockets[userId];
      if (socketIds && socketIds.length > 0 && userId !== ctx.state.user.id) {
        strapi.io
          .to(socketIds)
          .emit("newMessage", { message: messageAdded, conversationId: id });
      }
    }
    return { fakeId };
  },

  // create GRoupe conversation
  async createConverstationGroup(ctx) {
    const { titre, participants } = ctx.request.body;
    const user = ctx.state.user;
    console.log(ctx.request.body);

    if (!titre || !participants || participants.length === 0) {
      return ctx.badRequest("titre and participants are required.");
    }

    try {
      // Create the group conversation
      const newConversation = await strapi.db
        .query("api::conversation.conversation")
        .create({
          data: {
            titre: titre,
            participants: [...participants, user.id],
            type: "GROUP",
            admin: user.id,
          },
        });

      console.log("create new conversation");
      return ctx.send({
        msg: "Group created successfully",
        conversation: newConversation,
      });
    } catch (error) {
      strapi.log.error(error);
      return ctx.internalServerError("Something went wrong.");
    }
  },
});
