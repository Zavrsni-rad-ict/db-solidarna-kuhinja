"use strict";

const sanitizeSearchQuery = (query) => {
  return query
    .replace(/dj/gi, (match) => {
      return match === "dj" ? "đ" : "Đ"; // "dj" ide u "đ", "DJ" u "Đ"
    })
    .replaceAll(/s/g, "š")
    .replaceAll(/S/g, "Š")
    .replaceAll(/z/g, "ž")
    .replaceAll(/Z/g, "Ž")
    .replaceAll(/c/g, "ć")
    .replaceAll(/C/g, "Ć")
    .replaceAll(/c/g, "č")
    .replaceAll(/C/g, "Č");
};
// Miroslav -> Mirošlav

module.exports = {
  async find(ctx) {
    const {
      page = 1,
      pageSize = 10,
      search = "",
      all = false,
      role = "",
    } = ctx.query;

    // Konvertovanje page i pageSize u brojeve
    const pageNumber = parseInt(page, 10);
    const limit = all ? undefined : parseInt(pageSize, 10);
    const start = all ? 0 : (pageNumber - 1) * limit;

    // Proveri da li je pageNumber validan
    if (isNaN(pageNumber) || pageNumber < 1) {
      return ctx.badRequest("Invalid page number");
    }

    // Proveri da li je limit validan samo ako `all` nije true
    if (!all && (isNaN(limit) || limit < 1)) {
      return ctx.badRequest("Invalid page size");
    }

    const normalizedSearch = sanitizeSearchQuery(search);
    // console.log({ normalizedSearch, search });
    try {
      // Priprema filtera
      const filters = {
        $or: [
          { username: { $containsi: search } },
          { firstName: { $containsi: search } },
          { lastName: { $containsi: search } },
          { email: { $containsi: search } },
        ],
      };

      // Dodaj filtriranje po roli samo ako je role prosleđen
      if (role) {
        filters.role = { type: { $containsi: role } };
      }

      // Pribavljanje korisnika uz paginaciju i pretragu
      const users = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          limit,
          start,
          populate: "*",
          filters,
        }
      );

      // Ukupan broj korisnika na osnovu pretrage
      const totalUsers = await strapi.entityService.count(
        "plugin::users-permissions.user",
        {
          filters,
        }
      );

      // Broj stranica - kad je all=true, nema paginacije
      const pageCount = all ? 1 : Math.ceil(totalUsers / limit);

      // Vraćanje korisnika i meta informacija
      return {
        data: users,
        meta: {
          pagination: {
            page: all ? 1 : pageNumber,
            pageSize: all ? totalUsers : limit,
            pageCount,
            total: totalUsers,
          },
        },
      };
    } catch (error) {
      // Vraćanje greške u slučaju neuspjeha
      console.error("Error fetching users:", error);
      return ctx.internalServerError("Unable to fetch users");
    }
  },

  async removeEvent(ctx) {
    const { userId, eventId } = ctx.params;
    const signedKey = ctx.query.signedKey; // Uzimamo signedKey iz query parametara

    // Pronađi korisnika i populiraj sve relacije
    const user = await strapi.entityService.findOne(
      "plugin::users-permissions.user",
      userId,
      { populate: "*" } // Populiraj sve relacije
    );

    if (!user) {
      return ctx.throw(404, "User not found");
    }

    // Proveri da li je polje events definisano i da li je niz
    if (!Array.isArray(user.events)) {
      return ctx.throw(400, "User does not have any events registered");
    }

    // Filtriraj događaj iz niza events
    const updatedEvents = user.events.filter(
      (event) => event.id !== parseInt(eventId)
    );

    // Pronađi događaj na koji se korisnik odjavljuje
    const event = await strapi.entityService.findOne(
      "api::event.event", // Zameni sa stvarnim imenom tvoje entiteta za događaj
      eventId,
      { populate: "*" } // Populiraj sve relacije
    );

    if (!event) {
      return ctx.throw(404, "Event not found");
    }

    // Ažuriraj broj prijavljenih na osnovu signedKey
    const updatedSignedUpCount =
      event[signedKey] > 0 ? event[signedKey] - 1 : 0;

    // Ažuriraj korisnika i događaj
    await strapi.entityService.update(
      "plugin::users-permissions.user",
      userId,
      {
        data: { events: updatedEvents }, // Ažuriraj events
      }
    );

    await strapi.entityService.update(
      "api::event.event", // Zameni sa stvarnim imenom tvoje entiteta za događaj
      eventId,
      {
        data: { [signedKey]: updatedSignedUpCount }, // Ažuriraj polje na osnovu signedKey
      }
    );

    // Pribavi ažuriranog korisnika
    const updatedUser = await strapi.entityService.findOne(
      "plugin::users-permissions.user",
      userId,
      { populate: "*" } // Populiraj sve relacije
    );

    // Vrati ažuriranog korisnika
    return ctx.send({
      message: "Event removed successfully",
      user: updatedUser,
    });
  },
};
