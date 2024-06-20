module.exports = {
  routes: [
    {
      method: "GET",
      path: "/custom-profile/me",
      handler: "customprofile.fetchMyProfile",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/user-profile/:id",
      handler: "customprofile.fetchUserProfileById",
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
  ],
};
