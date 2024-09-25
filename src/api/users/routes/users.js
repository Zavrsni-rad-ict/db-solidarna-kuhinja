module.exports = {
  routes: [
    {
      method: "GET",
      path: "/users",
      handler: "users.find",
      config: {
        policies: [],
      },
    },
  ],
};
