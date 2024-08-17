// ./src/api/customauth/controllers/customauth.js

const assignation = require("../../assignation/controllers/assignation");

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

  /********************************************************************************/
  // /make the noteeee /
  async assignNote(ctx) {
    try {
      const { assignationId, note } = ctx.request.body;

      console.log("====================================");
      console.log("ctx.request.body");

      console.log(ctx.request.body);
      console.log("====================================");
      // Validation de l'entrée
      // if (!devoir || !etudiant || note == null || note < 0 || note > 20) {
      //   return ctx.badRequest(
      //     "Données invalides. Assurez-vous que le devoir, l'étudiant, et la note sont correctement fournis."
      //   );
      // }

      // Rechercher l'assignation correspondante
      const assignation = await strapi.db
        .query("api::assignation.assignation")
        .findOne({
          where: {
            id: assignationId,
          },
        });

      if (!assignation) {
        return ctx.notFound("Assignation non trouvée.");
      }

      console.log("this is assignation");
      console.log("====================================");
      console.log(assignation);
      console.log("====================================");

      // Mettre à jour la note de l'assignation
      const updatedAssignation = await strapi.db
        .query("api::assignation.assignation")
        .update({
          where: { id: assignation.id },
          data: { score: note },
        });

      ctx.send({
        message: "Note assignée avec succès",
        data: updatedAssignation,
      });
    } catch (error) {
      console.error("Erreur lors de l'assignation de la note:", error);
      ctx.throw(500, "Erreur interne du serveur");
    }
  },

  /***********************************************/
  /************** get scor of all the studenttt   ****************/
  // Find one attacheement   with history of  assignation  for revoir
  async findAllscoreOfStudent(ctx) {
    const { id, type } = ctx.params;

    console.log("Params:", ctx.params); // Log des paramètres

    let data;

    try {
      if (type.toUpperCase() === "INDIVIDUEL") {
        data = await strapi.entityService.findMany(
          "api::assignation.assignation",
          {
            filters: { etudiant: id },
            populate: ["devoir", "quiz", "etudiant"],
          }
        );
      } else if (type.toUpperCase() === "GROUP") {
        data = await strapi.entityService.findMany(
          "api::assignation.assignation",
          {
            filters: { group: id },
            populate: ["devoir", "quiz", "group", "etudiant"],
          }
        );
      }

      console.log("Data:", data); // Log des données récupérées

      if (!data || data.length === 0) {
        ctx.throw(404, "Aucune donnée trouvée pour les paramètres donnés.");
      }

      data = data.map((assignation) => ({
        group: assignation.group ? assignation.group.nom : null, // Vérifie si le groupe existe
        etudiant: assignation.etudiant ? assignation.etudiant.username : null, // Vérifie si l'étudiant existe
        devoir: assignation.devoir ? assignation.devoir.titre : null, // Vérifie si le devoir existe
        quiz: assignation.quiz ? assignation.quiz.titre : null, // Vérifie si le quiz existe
        score: assignation.score,
      }));
      ctx.body = data;
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      ctx.throw(500, "Erreur interne du serveur");
    }
  },
};
