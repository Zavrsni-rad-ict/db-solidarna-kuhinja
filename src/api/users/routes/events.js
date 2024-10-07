module.exports = {
  routes: [
    {
      method: "PUT",
      path: "/event/:id", // Definišeš PUT rutu za ažuriranje događaja
      handler: "events.updateEvent", // Pozivaš funkciju updateEvent iz kontrolera za događaje
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
