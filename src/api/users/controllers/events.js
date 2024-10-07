module.exports = {
  async updateEvent(ctx) {
    const { id } = ctx.params; // Event ID
    const { users, signedKey } = ctx.request.body.data; // signedKey je prosleđen u telu zahteva

    // Pronađi događaj
    const event = await strapi.entityService.findOne("api::event.event", id, {
      populate: "*",
    });

    if (!event) {
      return ctx.throw(404, "Event not found");
    }

    // Proveri da li je validan signedKey
    const validKeys = [
      "signedUpChefs",
      "signedUpDeliverer",
      "signedUpFieldWorkers",
    ];
    if (!validKeys.includes(signedKey)) {
      return ctx.throw(400, "Invalid signedKey specified");
    }

    // Inkrementiraj odgovarajuće polje
    const updatedFields = {
      [signedKey]: event[signedKey] + 1,
    };

    // Ažuriraj događaj sa novim korisnicima i odgovarajućim brojačem
    const updatedEvent = await strapi.entityService.update(
      "api::event.event",
      id,
      {
        data: {
          users, // Ažuriraj korisnike
          ...updatedFields, // Ažuriraj dinamički polje na osnovu signedKey
        },
      }
    );

    // Vrati ažurirani događaj
    return ctx.send({ data: updatedEvent });
  },
};
