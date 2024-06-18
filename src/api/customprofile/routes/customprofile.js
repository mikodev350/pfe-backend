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
      handler: "customprofile.findOne",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/find-profile/:id",
      handler: "customprofile.findUserProfileById",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/find-update-profile",
      handler: "customprofile.FindMyProfileForUpdate",
      config: {
        policies: [],
      },
    },
    // FindMyProfileForUpdate,
  ],
};
