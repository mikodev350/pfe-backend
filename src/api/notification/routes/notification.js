"use strict";

/**
 * notification router
 */

module.exports = {
  prefix: "",
  except: [],
  routes: [
    {
      method: "GET",
      path: "/notifications",
      handler: "notification.find",
    },
  ],
};
