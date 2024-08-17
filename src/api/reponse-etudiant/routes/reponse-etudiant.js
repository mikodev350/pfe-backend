module.exports = {
  routes: [
    {
      method: "POST",
      path: "/reponse-etudiants/putDevoir",
      handler: "reponse-etudiant.putDevoir",
      config: {},
    },
    {
      method: "GET",
      path: "/reponse-etudiants/checkDevoir",
      handler: "reponse-etudiant.checkDevoir",
      config: {},
    },
    {
      method: "GET",
      path: "/reponse-etudiants/filtered",
      handler: "reponse-etudiant.findFilteredDevoir",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
