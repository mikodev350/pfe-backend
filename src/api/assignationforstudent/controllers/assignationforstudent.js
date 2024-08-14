// ./src/api/customauth/controllers/customauth.js

module.exports = {
  async findForStudent(ctx) {
    try {
      const studentId = ctx.state.user.id;

      const assignations = await strapi.entityService.findMany(
        "api::assignation.assignation",
        {
          filters: {
            etudiant: {
              id: studentId,
            },
          },
          populate: ["devoir", "quiz", "professeur", "group", "etudiant"],
        }
      );

      if (!assignations || assignations.length === 0) {
        return ctx.throw(404, "Aucune assignation trouvée.");
      }

      const transformedData = assignations.map((assignation) => {
        let titre = "Titre non disponible";
        if (assignation.devoir && assignation.devoir.titre) {
          titre = assignation.devoir.titre;
        } else if (assignation.quiz && assignation.quiz.titre) {
          titre = assignation.quiz.titre;
        }
        return {
          id: assignation.id,
          titre: titre,
          type: assignation.devoir ? "DEVOIR" : "QUIZ",
        };
      });

      ctx.send(transformedData);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des assignations pour l'étudiant:",
        error
      );
      ctx.throw(500, "Erreur lors de la récupération des assignations");
    }
  },
};
