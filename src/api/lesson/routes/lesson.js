"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/lessons",
      handler: "lesson.find",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/lessons",
      handler: "lesson.create",
      config: {
        policies: [],
      },
    },
    {
      method: "PUT",
      path: "/lessons/:id",
      handler: "lesson.update",
      config: {
        policies: [],
      },
    },
  ],
};
