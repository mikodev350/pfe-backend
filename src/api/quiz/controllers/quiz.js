"use strict";

module.exports = ({ strapi }) => ({
  async create(ctx) {
    const userInfo = ctx.state.user;
    const { titre, duration, quiz } = ctx.request.body;

    const newQu = await Promise.all(
      quiz.map(async (item) => {
        // Vérification de l'existence des champs
        if (!item || !item.vraixreponse || !item.faussereponse) {
          throw new Error("Les données de quiz sont mal formatées");
        }

        // Créer les fausses réponses
        const faussereponse = await Promise.all(
          item.faussereponse.map(async (answ) => {
            return await strapi.db.query("api::reponse.reponse").create({
              data: {
                reponse: answ.reponse,
                isCorrect: false,
              },
            });
          })
        );

        // Créer la vraie réponse
        const vraixreponse = await strapi.db
          .query("api::reponse.reponse")
          .create({
            data: { reponse: item.vraixreponse, isCorrect: true },
          });

        // Créer la question avec les réponses associées
        const newQuistion = await strapi.db
          .query("api::question.question")
          .create({
            data: {
              question: item.question,
              reponses: [vraixreponse, ...faussereponse],
            },
          });
        return newQuistion;
      })
    );

    // Créer le quiz avec toutes les questions
    const newQuiz = await strapi.db.query("api::quiz.quiz").create({
      data: {
        titre: titre,
        duration: Number(duration),
        questions: newQu,
        auteur: userInfo,
      },
    });
    return newQuiz;
  },
  async findOne(ctx) {
    const result = await strapi.db.query("api::quiz.quiz").findOne({
      where: {
        auteur: ctx.state.user,
        id: ctx.request.params.id,
      },
      populate: {
        questions: {
          populate: {
            reponses: true,
          },
        },
      },
    });

    return result;
  },
  async findTest(ctx) {
    const result = await strapi.db
      .query("api::assignation.assignation")
      .findOne({
        where: {
          id: ctx.request.params.id,
        },
        populate: {
          quiz: {
            populate: {
              questions: {
                populate: {
                  reponses: {
                    select: ["reponse", "id"],
                  },
                },
              },
            },
          },
        },
      });

    if (result.score !== null) {
      return "SESSION TERMINÉE";
    }

    let randomQuiz = result.quiz;
    randomQuiz.questions = result.quiz.questions
      .map((question) => {
        question.reponses = question.reponses.sort(() => Math.random() - 0.5);
        return question;
      })
      .sort(() => Math.random() - 0.5);

    console.log("====================================");
    console.log(randomQuiz);
    console.log("====================================");
    return randomQuiz;
  },

  async find(ctx) {
    const result = await strapi.db.query("api::quiz.quiz").findMany({
      where: {
        auteur: ctx.state.user,
      },
      populate: {
        questions: true,
      },
    });
    return result.map((item) => {
      item.questions = item.questions.length;
      return item;
    });
  },

  async delete(ctx) {
    const { id } = ctx.params;

    const quiz = await strapi.db.query("api::quiz.quiz").findOne({
      where: { id, auteur: ctx.state.user.id },
      populate: { questions: { populate: { reponses: true } } },
    });

    if (!quiz) {
      return ctx.notFound("Quiz introuvable ou vous n'êtes pas l'auteur");
    }

    await Promise.all(
      quiz.questions.map(async (question) => {
        await strapi.db.query("api::reponse.reponse").deleteMany({
          where: { id: { $in: question.reponses.map((a) => a.id) } },
        });
        await strapi.db.query("api::question.question").delete({
          where: { id: question.id },
        });
      })
    );

    await strapi.db.query("api::quiz.quiz").delete({
      where: { id },
    });

    ctx.send({ message: "Quiz supprimé avec succès" });
  },
});

// "use strict";

// module.exports = ({ strapi }) => ({
//   async create(ctx) {
//     const userInfo = ctx.state.user;
//     const { title, duration, quiz } = ctx.request.body;
//     const newQu = await Promise.all(
//       quiz.map(async (item) => {
//         // Create wrong answers
//         const wrongAnswers = await Promise.all(
//           item.answers.map(async (answ) => {
//             return await strapi.db.query("api::answer.answer").create({
//               data: {
//                 answer: answ.answer,
//                 isCorrect: false,
//               },
//             });
//           })
//         );

//         // Create the correct answer
//         const correctAnswer = await strapi.db
//           .query("api::answer.answer")
//           .create({
//             data: { answer: quiz.correctAnswer, isCorrect: true },
//           });

//         // Extract the IDs from the created answers
//         console.log(wrongAnswers);
//         console.log([correctAnswer.id, ...wrongAnswers.map((item) => item.id)]);
//         const newQuistion = await strapi.db
//           .query("api::question.question")
//           .create({
//             data: {
//               question: item.correctAnswer,
//               answers: [correctAnswer, ...wrongAnswers],
//             },
//           });
//         return newQuistion;
//       })
//     );
//     const newQuiz = await strapi.db.query("api::quiz.quiz").create({
//       data: {
//         titre: title,
//         duration: Number(duration),
//         questions: newQu,
//         author: userInfo,
//       },
//     });
//     return newQuiz;
//   },
//   async findOne(ctx) {
//     const result = await strapi.db.query("api::quiz.quiz").findOne({
//       where: {
//         author: ctx.state.user,
//         id: ctx.request.params.id,
//       },
//       populate: {
//         questions: {
//           populate: {
//             answers: true,
//           },
//         },
//       },
//     });

//     return result;
//   },
//   async findTest(ctx) {
//     //! need to check if he has the ability to take the test
//     //! may we need to test assignation to find the test
//     //! We will use this code until the all tasts will be finished
//     const result = await strapi.db
//       .query("api::assignation.assignation")
//       .findOne({
//         where: {
//           id: ctx.request.params.id,
//         },
//         populate: {
//           quiz: {
//             populate: {
//               questions: {
//                 populate: {
//                   answers: {
//                     select: ["answer", "id"],
//                   },
//                 },
//               },
//             },
//           },
//         },
//       });
//     console.log(result);

//     if (result.score !== null) {
//       return "SESSION ENDED";
//     }
//     //! This code need to be optimazed but as i dont have a time, we use it as it wokrs

//     let randomQuiz = result.quiz;
//     console.log(randomQuiz);

//     randomQuiz.questions = result.quiz.questions
//       .map((question) => {
//         question.answers = question.answers.sort(() => Math.random() - 0.5);
//         return question;
//       })
//       .sort(() => Math.random() - 0.5);

//     return randomQuiz;
//   },
//   async find(ctx) {
//     const result = await strapi.db.query("api::quiz.quiz").findMany({
//       where: {
//         author: ctx.state.user,
//       },
//       populate: {
//         questions: true,
//       },
//     });
//     return result.map((item) => {
//       item.questions = item.questions.length;
//       return item;
//     });
//   },

//   async delete(ctx) {
//     const { id } = ctx.params;

//     const quiz = await strapi.db.query("api::quiz.quiz").findOne({
//       where: { id, author: ctx.state.user.id },
//       populate: { questions: { populate: { answers: true } } },
//     });

//     if (!quiz) {
//       return ctx.notFound("Quiz not found or you're not the author");
//     }

//     // Delete related questions and answers
//     await Promise.all(
//       quiz.questions.map(async (question) => {
//         await strapi.db.query("api::answer.answer").deleteMany({
//           where: { id: { $in: question.answers.map((a) => a.id) } },
//         });
//         await strapi.db.query("api::question.question").delete({
//           where: { id: question.id },
//         });
//       })
//     );

//     // Delete the quiz itself
//     await strapi.db.query("api::quiz.quiz").delete({
//       where: { id },
//     });

//     ctx.send({ message: "Quiz deleted successfully" });
//   },
// });
