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

    {
      method: "POST",
      path: "/user-custom/find-by-email",
      handler: "customauth.findUserByEmail",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/user-custom/forgot-password",
      handler: "customauth.forgotPassword",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/user-custom/reset-password",
      handler: "customauth.resetPassword",
      config: {
        policies: [],
      },
    },
  ],
};
