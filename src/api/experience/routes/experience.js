"use strict";

/**
 * experience router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::experience.experience", {
  only: ["find", "findOne", "create", "update", "delete"],

  routes: [
    {
      method: "POST",
      path: "/experiences",
      handler: "experience.create",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/experiences",
      handler: "experience.find",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/experiences/:id",
      handler: "experience.findOne",
      config: {
        policies: [],
      },
    },
    {
      method: "DELETE",
      path: "/experiences/:id",
      handler: "experience.delete",
      config: {
        policies: [],
      },
    },
    {
      method: "PUT",
      path: "/experiences/:id",
      handler: "experience.update",
      config: {
        policies: [],
      },
    },

    // ... (les autres routes)
  ],
});
