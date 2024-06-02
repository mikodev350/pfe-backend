module.exports = {
  routes: [
    {
      method: "GET",
      path: "/get-all-parcours",
      handler: "custom.getAllParcours",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/get-all-modules",
      handler: "custom.getAllModules",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/get-all-lessons",
      handler: "custom.getAllLessons",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
