"use strict";

/**
 * group router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::group.group", {
  config: {
    create: {
      policies: [], // Ajoutez des politiques ici si nécessaire
      middlewares: [],
    },
    update: {
      policies: [],
      middlewares: [],
    },
    find: {
      policies: [],
      middlewares: [],
    },
    findOne: {
      policies: [],
      middlewares: [],
    },
    delete: {
      policies: [],
      middlewares: [],
    },
  },

  routes: [
    {
      method: "POST",
      path: "/groups",
      handler: "group.create",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/groups/:id",
      handler: "group.update",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/groups",
      handler: "group.find",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/groups/:id",
      handler: "group.findOne",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "DELETE",
      path: "/groups/:id",
      handler: "group.delete",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
});
