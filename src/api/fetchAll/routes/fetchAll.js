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
    {
      method: "GET",
      path: "/fetch-conversation",
      handler: "fetch-all.getIdOfConversation",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
