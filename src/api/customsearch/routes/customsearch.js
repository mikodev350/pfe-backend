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
    {
      method: "GET",
      path: "/friends-search",
      handler: "customsearch.searchFriends",
      config: {
        policies: [],
      },
    },
  ],
};
