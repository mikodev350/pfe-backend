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
    {
      method: "POST",
      path: "/subscribe/notify",
      handler: "subsribe.notify",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
