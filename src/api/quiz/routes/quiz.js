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
  ],
};
