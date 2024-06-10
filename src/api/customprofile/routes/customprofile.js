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
    {
      method: "GET",
      path: "/get-my-profile/me",
      handler: "customprofile.getProfileOfUser",
      config: {
        policies: [],
      },
    },
  ],
};
