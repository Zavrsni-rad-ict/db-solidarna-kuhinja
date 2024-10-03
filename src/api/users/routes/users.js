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
    {
      method: "DELETE",
      path: "/users/:userId/events/:eventId",
      handler: "users.removeEvent", // prilagođeni kontroler za uklanjanje događaja
      config: {
        policies: [],
      },
    },
  ],
};
