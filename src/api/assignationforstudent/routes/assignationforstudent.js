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
    // this for attribute nooteee
    {
      method: "POST",
      path: "/assignations-custom/note",
      handler: "assignationforstudent.assignNote",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
