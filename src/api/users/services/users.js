"use strict";

/**
 * users service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "plugin::users-permissions.user",
  ({ strapi }) => ({
    // Ovdje možeš dodavati dodatne metode po potrebi

    async findOne(params) {
      return strapi.entityService.findOne(
        "plugin::users-permissions.user",
        params.id
      );
    },

    async update(id, data) {
      return strapi.entityService.update("plugin::users-permissions.user", id, {
        data,
      });
    },
  })
);
