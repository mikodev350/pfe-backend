"use strict";

const { Server } = require("socket.io");
const answer = require("./api/answer/controllers/answer");

let usersSockets = {};

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    //strapi.server.httpServer is the new update for Strapi V4
    let io = new Server(strapi.server.httpServer);
    let currentUser = {};
    io.on("connection", async function (socket) {
      //Listening for a connection from the frontend
      console.log("user connected");
      const token = socket?.handshake?.query?.token;
      console.log(token);
      // console.log(token);
      // // decrypt the jwt
      if (token) {
        const obj = await strapi.plugins[
          "users-permissions"
        ].services.jwt.verify(token);

        if (obj) {
          const user = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
              where: {
                id: obj.id,
              },
            });
          if (user) {
            currentUser = user;
            let sameUser = usersSockets[obj.id] ? usersSockets[obj.id] : [];
            usersSockets = {
              ...usersSockets,
              [obj.id]: [...sameUser, socket.id],
            };
            strapi.io = socket;
            strapi.usersSockets = usersSockets;
          }
          socket.on("seen_conversation", async ({ conversationId }) => {
            // Fetch the existing conversation
            const conversation = await strapi.db
              .query("api::conversation.conversation")
              .findOne({
                where: { id: conversationId },
                select: ["id"],
                populate: {
                  users_seen_message: true,
                },
              });
            if (conversation) {
              const oldUsersSeenMessage = conversation.users_seen_message;
              // Check if the user is already in the relation
              const userExists = oldUsersSeenMessage.some(
                (item) => item.id === user.id
              );
              if (!userExists) {
                // If not, add the user to the relation
                const newUsersSeenMessage = [
                  ...oldUsersSeenMessage.map((item) => item.id),
                  user.id,
                ];
                // Update the conversation with the new relation
                await strapi.db.query("api::conversation.conversation").update({
                  where: { id: conversationId },
                  data: {
                    users_seen_message: newUsersSeenMessage,
                  },
                });
              }
            }
          });

          socket.on(
            "set-answer-quiz",
            async ({ assignationId, answerId, questionId }) => {
              console.log(user);

              const assignation = await strapi.db
                .query("api::assignation.assignation")
                .findOne({
                  where: {
                    id: assignationId,
                    etudiant: user,
                  },
                  select: ["id", "score"],
                });

              if (assignation && assignation.score === null) {
                const answer = await strapi.db
                  .query("api::answer-history.answer-history")
                  .findOne({
                    where: {
                      question: questionId,
                      student: user,
                      //assignation: assignationId,
                    },
                    select: ["id"],
                  });
                console.log(answer);

                if (answer) {
                  await strapi.db
                    .query("api::answer-history.answer-history")
                    .update({
                      where: {
                        question: questionId,
                        student: user,
                        // assignation: assignationId,
                      },
                      data: {
                        answer: answerId,
                      },
                    });
                } else {
                  await strapi.db
                    .query("api::answer-history.answer-history")
                    .create({
                      data: {
                        question: questionId,
                        // assignation: assignationId,
                        answer: answerId,
                        student: user,
                      },
                    });
                }
              }
            }
          );
          socket.on("end-quiz", async ({ assignationId }) => {
            //get questions and ids of answers questions
            const filteredQuestionCount = await strapi.db
              .query("api::quiz.quiz")
              .findOne({
                where: {
                  assignation: assignationId,
                  questions: {
                    answers: {
                      isCorrect: true,
                    },
                  },
                },
                populate: {
                  questions: {
                    select: ["id"],
                    populate: {
                      answers: true,
                    },
                  },
                },
              });

            let totalQuestion = filteredQuestionCount?.questions?.length;
            let correctAnswersIds = filteredQuestionCount?.questions.map(
              (item) => {
                return item.answers[0].id;
              }
            );
            console.log("correctAnswersIds: => ", correctAnswersIds);
            //!TODO: need to check the number 1 by assignationId
            const answersHistory = await strapi.db
              .query("api::answer-history.answer-history")
              .findMany({
                where: {
                  // assignation: assignationId,
                  student: user,
                },
                populate: {
                  answer: {
                    select: ["id"],
                  },
                },
              });

            const studentAnswers = answersHistory.map(
              (item) => item?.answer?.id
            );
            console.log("studentAnswers: => ", studentAnswers);
            //calculate how many correct answer selected
            const totalCorrectAnswerSelected = studentAnswers.reduce(
              (total, currentAnswer) => {
                if (correctAnswersIds.includes(currentAnswer)) {
                  return total + 1;
                }
                return total;
              },
              0
            );

            const calculateScore =
              (totalCorrectAnswerSelected * 20) / totalQuestion;

            await strapi.db.query("api::assignation.assignation").update({
              where: {
                id: assignationId, // Here, you're filtering by the id of the assignation
              },
              data: {
                score: Number(calculateScore), // Here, you're updating the score attribute
              },
            });
          });
          socket.on("disconnect", () => {
            if (user) {
              console.log("user disconnected");
              if (user) {
                if (usersSockets[obj.id]) {
                  usersSockets[obj.id] = usersSockets[obj.id].filter(
                    (item) => item !== socket.id
                  );
                  if (usersSockets[obj.id].length === 0) {
                    // If no more sockets for this user, delete the user entry
                    delete usersSockets[obj.id];
                  }
                }
                strapi.io = io;
                strapi.usersSockets = usersSockets;
              }
            }
          });
          strapi.io = io;
          strapi.usersSockets = usersSockets;
        }
      }
    });
  },
};
