module.exports = {
  routes: [
    {
      method: "POST",
      path: "/answer-histories",
      handler: "answer-history.create",
      config: {},
    },
  ],
};
