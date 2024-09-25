"use strict";

const sanitizeSearchQuery = (query) => {
  return query
    .replaceAll(/dj/g, "đ")
    .replaceAll(/DJ/g, "Đ")
    .replaceAll(/dJ/g, "Đ")
    .replaceAll(/Dj/g, "Đ")
    .replaceAll(/s/g, "š")
    .replaceAll(/S/g, "Š")
    .replaceAll(/z/g, "ž")
    .replaceAll(/Z/g, "Ž")
    .replaceAll(/c/g, "č")
    .replaceAll(/C/g, "Č")
    .replaceAll(/c/g, "ć")
    .replaceAll(/C/g, "Ć");
};

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
    console.log({ normalizedSearch });
    try {
      // Priprema filtera
      const filters = {
        $or: [
          { username: { $containsi: normalizedSearch } },
          { firstName: { $containsi: normalizedSearch } },
          { lastName: { $containsi: normalizedSearch } },
          { email: { $containsi: normalizedSearch } },
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
};
