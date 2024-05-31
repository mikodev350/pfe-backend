module.exports = {
  routes: [
    {
      method: "GET",
      path: "/find-parcours",
      handler: "custom.getParcours",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/find-by-parcours/:parcoursId",
      handler: "custom.getModulesByParcours",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/find-by-module/:moduleId",
      handler: "custom.getLessonsByModule",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
