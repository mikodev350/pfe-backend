"use strict";

/**
 * resource router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::resource.resource", {
  only: ["find", "findOne", "create", "update", "delete"],
  config: {
    create: {
      auth: false, // Mettre à true pour nécessiter une authentification
      policies: [],
      middlewares: [],
    },
  },
  routes: [
    {
      method: "POST",
      path: "/resources",
      handler: "resource.create",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
});
