module.exports = {
  routes: [
    {
      method: "POST",
      path: "/answer-histories",
      handler: "answer-history.create",
      config: {},
    },
    {
      method: "GET",
      path: "/answer-histories/:id",
      handler: "answer-history.findOne",
      config: {},
    },
    {
      method: "PUT",
      path: "/answer-histories/:id",
      handler: "answer-history.update",
      config: {},
    },
  ],
};
