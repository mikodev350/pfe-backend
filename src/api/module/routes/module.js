const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::module.module", {
  only: ["find", "findOne", "create", "update", "delete"],
  routes: [
    {
      method: "PUT",
      path: "/modules/:id",
      handler: "module.update",
      config: {
        policies: [],
        auth: false, // Changez à true si vous souhaitez exiger une authentification
      },
    },
    {
      method: "GET",
      path: "/modules",
      handler: "module.find",
      config: {
        policies: [],
        auth: false, // Changez à true si vous souhaitez exiger une authentification
      },
    },
    {
      method: "POST",
      path: "/modules",
      handler: "module.create",
      config: {
        policies: [],
      },
    },
  ],
});
