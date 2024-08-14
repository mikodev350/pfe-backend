"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/assignations",
      handler: "assignation.find",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/assignations/:id",
      handler: "assignation.findOne",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/assignations",
      handler: "assignation.create",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/assignations/:id",
      handler: "assignation.update",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "DELETE",
      path: "/assignations/:id",
      handler: "assignation.delete",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // {
    //   method: "GET",
    //   path: "/assignations/student",
    //   handler: "assignation.findForStudent",
    //   config: {
    //     policies: [],
    //     middlewares: [],
    //   },
    // },
  ],
};
