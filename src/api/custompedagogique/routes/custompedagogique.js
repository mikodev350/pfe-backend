module.exports = {
  routes: [
    {
      method: "GET",
      path: "/get-all-students",
      handler: "custompedagogique.getAllStudents",
    },
    // {
    //   method: "POST",
    //   path: "/remove-participant",
    //   handler: "custompedagogique.removeParticipant",
    // },
  ],
};
