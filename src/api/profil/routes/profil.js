"use strict";

/**
 * profil router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::profil.profil", {
  routes: [
    {
      method: "POST",
      path: "/profils",
      handler: "profil.create",
      config: {
        policies: [],
      },
    },
    // {
    //   method: "GET",
    //   path: "/profils/me",
    //   handler: "profil.findOne",
    //   config: {
    //     policies: [],
    //   },
    // },
    {
      method: "PUT",
      path: "/profils/:id",
      handler: "profil.update",
      config: {
        policies: [],
      },
    },
  ],
});
