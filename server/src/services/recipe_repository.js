"use strict";

const EventEmitter = require("node:events");
const { equals } = require("../util/object.js");
const { trackEvents } = require("../util/track_events.js");
const realDbClient = require("./db_client.js");

module.exports = class RecipeRepository {
  static create() {
    return new RecipeRepository(realDbClient);
  }

  static createNull(options = {}) {
    const clientOptions = {
      findMany: (options.find ?? []).map(({ params, response }) => ({
        params: { where: { title: { contains: params?.title } } },
        response: response.data,
      })),
    };
    return new RecipeRepository(newNullDbClient(clientOptions));
  }

  constructor(dbClient) {
    this._dbClient = dbClient;
    this._emitter = new EventEmitter();
  }

  async store(recipe) {
    this._emitter.emit("store", recipe);
    await this._dbClient.recipe.create({ data: recipe });
  }

  async find(filter = {}) {
    const recipes = await this._dbClient.recipe.findMany({
      where: { title: { contains: filter.title || undefined } },
    });
    return {
      data: recipes,
    };
  }

  trackCalls(methodName) {
    return trackEvents(this._emitter, methodName);
  }
};

const newNullDbClient = (options) => ({
  recipe: {
    create: () => Promise.resolve(),
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
