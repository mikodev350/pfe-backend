"use strict";

/**
 * conversation router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/conversations/private",
      handler: "conversation.findPrivateConversations",
    },
    {
      method: "GET",
      path: "/conversations/group",
      handler: "conversation.findGroupConversations",
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
    {
      method: "POST",
      path: "/conversation/:id",
      handler: "conversation.createMessage",
    },

    {
      method: "POST",
      path: "/create-conversation-groupe",
      handler: "conversation.createConverstationGroup",
    },
  ],
};
