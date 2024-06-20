"use strict";

const { Server } = require("socket.io");

let usersSockets = {};

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    //strapi.server.httpServer is the new update for Strapi V4

    let io = new Server(strapi.server.httpServer);

    io.on("connection", async function (socket) {
      //Listening for a connection from the frontend
      console.log("user connected");

      const token = socket?.handshake?.query?.token;
      console.log(token);
      // console.log(token);
      // // decrypt the jwt
      if (token) {
        const obj = await strapi.plugins[
          "users-permissions"
        ].services.jwt.verify(token);
        console.log(obj);
        if (obj) {
          const user = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
              where: {
                id: obj.id,
              },
            });
          if (user) {
            let sameUser = usersSockets[obj.id] ? usersSockets[obj.id] : [];
            usersSockets = {
              ...usersSockets,
              [obj.id]: [...sameUser, socket.id],
            };
            strapi.io = socket;
            strapi.usersSockets = usersSockets;
          }
          socket.on("seen_conversation", async ({ conversationId }) => {
            console.log("LOGS FROM SOCKET seen_conversation");
            console.log(conversationId);
            // Fetch the existing conversation
            const conversation = await strapi.db
              .query("api::conversation.conversation")
              .findOne({
                where: { id: conversationId },
                select: ["id"],
                populate: {
                  users_seen_message: true,
                },
              });

            if (conversation) {
              const oldUsersSeenMessage = conversation.users_seen_message;

              // Check if the user is already in the relation
              const userExists = oldUsersSeenMessage.some(
                (item) => item.id === user.id
              );

              if (!userExists) {
                // If not, add the user to the relation
                const newUsersSeenMessage = [
                  ...oldUsersSeenMessage.map((item) => item.id),
                  user.id,
                ];

                // Update the conversation with the new relation
                await strapi.db.query("api::conversation.conversation").update({
                  where: { id: conversationId },
                  data: {
                    users_seen_message: newUsersSeenMessage,
                  },
                });
              }
            }
          });

          socket.on("disconnect", () => {
            if (user) {
              console.log("user disconnected");
              if (user) {
                if (usersSockets[obj.id]) {
                  usersSockets[obj.id] = usersSockets[obj.id].filter(
                    (item) => item !== socket.id
                  );

                  if (usersSockets[obj.id].length === 0) {
                    // If no more sockets for this user, delete the user entry
                    delete usersSockets[obj.id];
                  }
                }
                strapi.io = io;
                strapi.usersSockets = usersSockets;
              }
            }
          });
          strapi.io = io;
          strapi.usersSockets = usersSockets;
        }
      }
    });
  },
};
