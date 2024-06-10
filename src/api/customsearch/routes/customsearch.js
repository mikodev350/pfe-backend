module.exports = {
  routes: [
    {
      method: "GET",
      path: "/custom-search/advanced",
      handler: "customsearch.advancedSearch",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/custom-search/users",
      handler: "customsearch.searchUsers",
      config: {
        policies: [],
      },
    },
  ],
};
