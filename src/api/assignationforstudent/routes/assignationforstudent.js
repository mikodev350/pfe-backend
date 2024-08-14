// ./src/api/user/routes/custom-user-routes.js

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/assignations-custom/student",
      handler: "assignationforstudent.findForStudent",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
