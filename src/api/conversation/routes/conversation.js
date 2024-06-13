"use strict";

/**
 * conversation router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/conversations",
      handler: "conversation.findConversations",
    },
    {
      method: "GET",
      path: "/conversation/:id",
      handler: "conversation.findOne",
    },
    {
      method: "GET",
      path: "/find-conversation-id",
      handler: "conversation.findConversationId",
    },
  ],
};
