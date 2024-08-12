"use strict";

module.exports = ({ strapi }) => ({
  async create(ctx) {
    const userInfo = ctx.state.user;
    const { title, duration, quiz } = ctx.request.body;
    const newQu = await Promise.all(
      quiz.map(async (item) => {
        // Create wrong answers
        const wrongAnswers = await Promise.all(
          item.answers.map(async (answ) => {
            return await strapi.db.query("api::answer.answer").create({
              data: {
                answer: answ.answer,
                isCorrect: false,
              },
            });
          })
        );

        // Create the correct answer
        const correctAnswer = await strapi.db
          .query("api::answer.answer")
          .create({
            data: { answer: quiz.correctAnswer, isCorrect: true },
          });

        // Extract the IDs from the created answers
        console.log(wrongAnswers);
        console.log([correctAnswer.id, ...wrongAnswers.map((item) => item.id)]);
        const newQuistion = await strapi.db
          .query("api::question.question")
          .create({
            data: {
              question: item.correctAnswer,
              answers: [correctAnswer, ...wrongAnswers],
            },
          });
        return newQuistion;
      })
    );
    const newQuiz = await strapi.db.query("api::quiz.quiz").create({
      data: {
        titre: title,
        duration: Number(duration),
        questions: newQu,
        author: userInfo,
      },
    });
    return newQuiz;
  },
  async findOne(ctx) {
    return await strapi.db.query("api::quiz.quiz").findOne({
      where: {
        author: ctx.state.user,
        id: ctx.request.params.id,
      },
      populate: {
        questions: {
          populate: {
            answers: true,
          },
        },
      },
    });
  },
});
