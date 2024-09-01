module.exports = {
  routes: [
    {
      method: "POST",
      path: "/subscribe",
      handler: "subsribe.subscribePost",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
