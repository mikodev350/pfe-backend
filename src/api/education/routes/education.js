"use strict";

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::education.education", {
  only: ["find", "findOne", "create", "update", "delete"],

  routes: [
    {
      method: "POST",
      path: "/educations",
      handler: "education.create",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/educations",
      handler: "education.find",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "DELETE",
      path: "/educations/:id",
      handler: "education.delete",
      config: {
        policies: [],
      },
    },
    {
      method: "PUT",
      path: "/educations/:id",
      handler: "education.update",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/educations/:id",
      handler: "education.findOne",
      config: {
        policies: [],
      },
    },

    // ... (les autres routes)
  ],
});
