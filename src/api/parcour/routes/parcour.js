// 'use strict';

// /**
//  * parcour router
//  */

// const { createCoreRouter } = require('@strapi/strapi').factories;

// module.exports = createCoreRouter('api::parcour.parcour');

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::parcour.parcour", {
  only: ["find", "findOne", "create", "update", "delete"],
  routes: [
    {
      method: "POST",
      path: "/parcours",
      handler: "parcour.create",
    },
    {
      method: "GET",
      path: "/parcours",
      handler: "parcour.find",
      config: {
        policies: [],
        auth: false, // Changez à true si vous souhaitez exiger une authentification
      },
    },
  ],
});
