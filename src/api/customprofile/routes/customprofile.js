module.exports = {
  routes: [
    {
      method: "GET",
      path: "/custom-profile/me",
      handler: "customprofile.findOne",
      config: {
        policies: [],
      },
    },
  ],
};
