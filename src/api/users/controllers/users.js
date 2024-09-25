"use strict";

module.exports = {
  async find(ctx) {
    const { page = 1, pageSize = 10 } = ctx.query;

    // Konvertovanje page i pageSize u brojeve
    const pageNumber = parseInt(page, 10);
    const limit = parseInt(pageSize, 10);
    const start = (pageNumber - 1) * limit;

    // Pribavljanje korisnika uz paginaciju
    const users = await strapi.entityService.findMany(
      "plugin::users-permissions.user",
      {
        limit,
        start,
        populate: "*", // Ako želiš da popuniš sve povezane entitete
      }
    );

    // Ukupan broj korisnika
    const totalUsers = await strapi.entityService.count(
      "plugin::users-permissions.user"
    );

    // Broj stranica
    const pageCount = Math.ceil(totalUsers / limit);

    // Vraćanje korisnika i meta informacija
    return {
      data: users, // Vraćamo korisnike direktno, bez sanitizacije
      meta: {
        pagination: {
          page: pageNumber,
          pageSize: limit,
          pageCount,
          total: totalUsers,
        },
      },
    };
  },
};
