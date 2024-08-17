"use strict";

/**
 * quiz router
 */

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/quiz",
      handler: "quiz.create",
    },
    {
      method: "GET",
      path: "/quiz/:id",
      handler: "quiz.findOne",
    },
    {
      method: "GET",
      path: "/take-quiz/:id",
      handler: "quiz.findTest",
    },
    {
      method: "GET",
      path: "/my-quizzes",
      handler: "quiz.find",
    },
    {
      method: "DELETE",
      path: "/quiz/:id",
      handler: "quiz.delete",
    },
  ],
};
