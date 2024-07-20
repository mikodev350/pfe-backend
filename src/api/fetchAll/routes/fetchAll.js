module.exports = {
  routes: [
    {
      method: "GET",
      path: "/fetch-all/parcours-data",
      handler: "fetch-all.findAllData",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
