"use strict";

const EventEmitter = require("node:events");
const { trackEvents } = require("../util/track_events.js");
const realDbClient = require("./db_client.js");

module.exports = class RecipeRepository {
  static create() {
    return new RecipeRepository(realDbClient);
  }

  static createNull() {
    return new RecipeRepository(newNullDbClient());
  }

  constructor(dbClient) {
    this._dbClient = dbClient;
    this._emitter = new EventEmitter();
  }

  async store(recipeInput) {
    this._emitter.emit("store", recipeInput);
    await this._dbClient.recipe.create({ data: recipeInput });
  }

  trackCalls(methodName) {
    return trackEvents(this._emitter, methodName);
  }
};

const newNullDbClient = () => ({
  recipe: {
    create: () => Promise.resolve(),
  },
});
