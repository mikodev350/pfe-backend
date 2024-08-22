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
    //  this is to get score for student
    {
      method: "GET",
      path: "/assignations-custom/:type/:id",
      handler: "assignationforstudent.findAllscoreOfStudent",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/assignations-custom/notes",
      handler: "assignationforstudent.findAllScore",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/assignations-custom/recent",
      handler: "assignationforstudent.findRecentResource",
      config: {
        policies: [],
      },
    },
  ],
};
