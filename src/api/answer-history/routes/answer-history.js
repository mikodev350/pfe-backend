module.exports = {
  routes: [
    {
      method: "POST",
      path: "/answer-histories/putDevoir",
      handler: "answer-history.putDevoir",
      config: {},
    },
    {
      method: "GET",
      path: "/answer-histories/checkDevoir",
      handler: "answer-history.checkDevoir",
      config: {},
    },
    {
      method: "GET",
      path: "/answer-histories/filtered",
      handler: "answer-history.findFilteredDevoir",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
