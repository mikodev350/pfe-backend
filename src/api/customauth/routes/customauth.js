// ./src/api/user/routes/custom-user-routes.js

module.exports = {
  routes: [
    {
      method: "PUT",
      path: "/user-custom/update-role",
      handler: "customauth.updateRole",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
