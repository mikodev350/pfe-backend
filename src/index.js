"use strict";

const { Server } = require("socket.io");
// const answer = require("./api/answer/controllers/answer");

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

          /************************************************************************/
          socket.on(
            "set-answer-quiz",
            async ({ assignationId, answerId, questionId }) => {
              try {
                // Récupérer l'assignation pour l'étudiant en question
                const assignation = await strapi.db
                  .query("api::assignation.assignation")
                  .findOne({
                    where: {
                      id: assignationId,
                      etudiant: user.id, // Assurez-vous que "user" contient l'ID de l'étudiant
                    },
                    select: ["id", "score"],
                  });

                // Vérifier si l'assignation existe et que le score est encore null (donc quiz non complété)
                if (assignation && assignation.score === null) {
                  // Vérifier si une réponse existe déjà pour cette question et cet étudiant
                  const existingAnswer = await strapi.db
                    .query("api::reponse-etudiant.reponse-etudiant")
                    .findOne({
                      where: {
                        question: questionId,
                        etudiant: user.id,
                        assignation: assignationId,
                      },
                      select: ["id"],
                    });

                  // Si une réponse existe, la mettre à jour
                  if (existingAnswer) {
                    await strapi.db
                      .query("api::reponse-etudiant.reponse-etudiant")
                      .update({
                        where: {
                          id: existingAnswer.id,
                        },
                        data: {
                          reponse: answerId,
                        },
                      });
                  } else {
                    // Sinon, créer une nouvelle réponse pour cette question
                    await strapi.db
                      .query("api::reponse-etudiant.reponse-etudiant")
                      .create({
                        data: {
                          question: questionId,
                          reponse: answerId,
                          etudiant: user.id,
                          assignation: assignationId,
                        },
                      });
                  }
                }
              } catch (error) {
                console.error(
                  "Erreur lors de l'enregistrement de la réponse:",
                  error
                );
              }
            }
          );

          /***************************************************************************/
          socket.on("end-quiz", async ({ assignationId, examId }) => {
            try {
              // Récupérer les questions et les IDs des réponses correctes pour l'assignation
              const filteredQuestionCount = await strapi.db
                .query("api::quiz.quiz")
                .findOne({
                  where: {
                    id: examId,
                  },
                  populate: {
                    questions: {
                      select: ["id"],
                      populate: {
                        reponses: {
                          where: {
                            isCorrect: true,
                          },
                          select: ["id"],
                        },
                      },
                    },
                  },
                });

              console.log(filteredQuestionCount);

              // Calculer le nombre total de questions
              let totalQuestion = filteredQuestionCount?.questions?.length || 0;

              // Extraire les IDs des réponses correctes
              let correctAnswersIds =
                filteredQuestionCount?.questions.flatMap((question) =>
                  question.reponses.map((reponse) => reponse.id)
                ) || [];

              console.log("correctAnswersIds: => ", correctAnswersIds);

              // Récupérer les réponses de l'étudiant pour l'assignation spécifique
              const answersHistory = await strapi.db
                .query("api::reponse-etudiant.reponse-etudiant")
                .findMany({
                  where: {
                    assignation: assignationId,
                    etudiant: user.id,
                  },
                  populate: {
                    reponse: {
                      select: ["id"],
                    },
                  },
                });

              // Extraire les IDs des réponses fournies par l'étudiant
              const studentAnswers = answersHistory.map(
                (item) => item?.reponse?.id
              );
              console.log("studentAnswers: => ", studentAnswers);

              // Calculer le nombre de réponses correctes sélectionnées par l'étudiant
              const totalCorrectAnswerSelected = studentAnswers.reduce(
                (total, currentAnswer) => {
                  if (correctAnswersIds.includes(currentAnswer)) {
                    return total + 1;
                  }
                  return total;
                },
                0
              );

              // Calculer le score final
              const calculateScore =
                (totalCorrectAnswerSelected * 20) / totalQuestion;

              // Mettre à jour l'assignation avec le score calculé
              await strapi.db.query("api::assignation.assignation").update({
                where: {
                  id: assignationId,
                },
                data: {
                  score: Number(calculateScore),
                },
              });

              console.log(
                `Quiz terminé avec succès. Score calculé: ${calculateScore}`
              );
            } catch (error) {
              console.error("Erreur lors de la finalisation du quiz:", error);
            }
          });

          /**********************************************************************************/
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
