module.exports = {
  async updateEvent(ctx) {
    const { id } = ctx.params; // Event ID
    const { users } = ctx.request.body.data; // Pretpostavimo da users dolazi u telu zahteva

    // Pronađi događaj
    const event = await strapi.entityService.findOne("api::event.event", id, {
      populate: "*",
    });

    if (!event) {
      return ctx.throw(404, "Event not found");
    }

    // Inkrementiraj signedUpChefs
    const updatedSignedUpChefs = event.signedUpChefs + 1;

    console.log("EEEE SRBIJA");

    // Ažuriraj događaj sa novim korisnicima i signedUpChefs
    const updatedEvent = await strapi.entityService.update(
      "api::event.event",
      id,
      {
        data: {
          users, // Ažuriraj korisnike
          signedUpChefs: updatedSignedUpChefs, // Inkrementiraj broj prijavljenih chefova
        },
      }
    );

    // Vrati ažurirani događaj
    return ctx.send({ data: updatedEvent });
  },
};
