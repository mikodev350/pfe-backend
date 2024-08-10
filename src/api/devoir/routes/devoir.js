module.exports = {
  routes: [
    {
      method: "POST",
      path: "/devoirs",
      handler: "devoir.create",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/devoirs",
      handler: "devoir.find",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/devoirs/:id",
      handler: "devoir.findOne",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/devoirs/:id",
      handler: "devoir.update",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "DELETE",
      path: "/devoirs/:id",
      handler: "devoir.delete",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
