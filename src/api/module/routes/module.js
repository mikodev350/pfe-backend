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
      },
    },
    {
      method: "GET",
      path: "/modules",
      handler: "module.find",
      config: {
        policies: [],
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
    {
      method: "DELETE",
      path: "/modules/:id",
      handler: "module.delete",
      config: {
        policies: [],
      },
    },
    ,
    {
      method: "GET",
      path: "/modules/:id",
      handler: "module.findOne",
      config: {
        policies: [],
      },
    },
  ],
});
