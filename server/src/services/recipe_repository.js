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

  async store(recipe) {
    this._emitter.emit("store", recipe);
    await this._dbClient.recipe.create({ data: recipe });
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
