"use strict";

const { equals } = require("../util/object.js");
const realDbClient = require("./db_client.js");

module.exports = class AutocompleteRepository {
  static create() {
    return new AutocompleteRepository(realDbClient());
  }

  static createNull(options = {}) {
    const findTags = options.findTags ?? [];
    const findOfflineSourceTitles = options.findOfflineSourceTitles ?? [];

    const clientOptions = {
      tag: {
        findMany: findTags.map(({ params, response }) => ({
          params: {
            select: { name: true },
          },
          response: response.map((name) => ({ name })),
        })),
      },

      recipe: {
        findMany: findOfflineSourceTitles.map(({ params, response }) => ({
          params: {
            select: { offlineSourceTitle: true },
            where: { offlineSourceTitle: { not: null } },
            distinct: ["offlineSourceTitle"],
          },
          response: response.map((offlineSourceTitle) => ({
            offlineSourceTitle,
          })),
        })),
      },
    };
    return new AutocompleteRepository(newNullDbClient(clientOptions));
  }

  constructor(dbClient) {
    this._dbClient = dbClient;
  }

  async findTags() {
    const tags = await this._dbClient.tag.findMany({
      select: { name: true },
    });

    return tags.map(({ name }) => name);
  }

  async findOfflineSourceTitles() {
    const offlineSourceTitles = await this._dbClient.recipe.findMany({
      select: { offlineSourceTitle: true },
      where: { offlineSourceTitle: { not: null } },
      distinct: ["offlineSourceTitle"],
    });

    return offlineSourceTitles.map(
      ({ offlineSourceTitle }) => offlineSourceTitle
    );
  }
};

const newNullDbClient = (options) => ({
  tag: {
    findMany: (params) => {
      const responses = options.tag.findMany;
      const match = responses.find((response) =>
        equals(response.params, params)
      ) ?? {
        response: [],
      };

      return Promise.resolve(match.response);
    },
  },

  recipe: {
    findMany: (params) => {
      const responses = options.recipe.findMany;
      const match = responses.find((response) =>
        equals(response.params, params)
      ) ?? {
        response: [],
      };

      return Promise.resolve(match.response);
    },
  },
});
