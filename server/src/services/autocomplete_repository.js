"use strict";

const { equals } = require("../util/object.js");
const realDbClient = require("./db_client.js");

module.exports = class AutocompleteRepository {
  static create() {
    return new AutocompleteRepository(realDbClient);
  }

  static createNull(options = {}) {
    const clientOptions = {
      findMany: (options.findTags ?? []).map(({ params, response }) => ({
        params: {
          select: { name: true },
          orderBy: { name: "asc" },
        },
        response: response.map((name) => ({ name })),
      })),
    };
    return new AutocompleteRepository(newNullDbClient(clientOptions));
  }

  constructor(dbClient) {
    this._dbClient = dbClient;
  }

  async findTags() {
    const tags = await this._dbClient.tag.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    });

    return tags.map(({ name }) => name);
  }
};

const newNullDbClient = (options) => ({
  tag: {
    findMany: (params) => {
      const responses = options.findMany;
      const match = responses.find((response) =>
        equals(response.params, params)
      ) ?? {
        response: [],
      };

      return Promise.resolve(match.response);
    },
  },
});
