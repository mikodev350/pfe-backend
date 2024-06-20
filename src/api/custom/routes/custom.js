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
    {
      method: "GET",
      path: "/resources-link/:id/generate-link",
      handler: "custom.generateLink",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/resources-link/access/:token",
      handler: "custom.accessResource",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/resources-copy/clone/:id",
      handler: "custom.cloneResource",
      config: {
        policies: [],
      },
    },
  ],
};
