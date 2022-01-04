"use strict";

const EventEmitter = require("node:events");
const { trackEvents } = require("../util/track_events.js");
const realDbClient = require("./db_client.js");

module.exports = class RecipeRepository {
  static create() {
    return new RecipeRepository(realDbClient);
  }

  static createNull(options) {
    return new RecipeRepository(newNullDbClient(options));
  }

  constructor(dbClient) {
    this._dbClient = dbClient;
    this._emitter = new EventEmitter();
  }

  async store(recipe) {
    this._emitter.emit("store", recipe);
    await this._dbClient.recipe.create({ data: recipe });
  }

  async findAll() {
    const recipes = await this._dbClient.recipe.findMany();
    return {
      data: recipes,
    };
  }

  trackCalls(methodName) {
    return trackEvents(this._emitter, methodName);
  }
};

const newNullDbClient = (options = {}) => ({
  recipe: {
    create: () => Promise.resolve(),
    findMany: () => {
      const responses = options.findAll ?? [];
      const match = responses[0] ?? { response: [] };

      return Promise.resolve(match.response);
    },
  },
});
