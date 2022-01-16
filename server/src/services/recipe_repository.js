"use strict";

const EventEmitter = require("node:events");
const { equals } = require("../util/object.js");
const { trackEvents } = require("../util/track_events.js");
const realDbClient = require("./db_client.js");

const selectRecipeProps = { recipeId: true, name: true, notes: true };

module.exports = class RecipeRepository {
  static create() {
    return new RecipeRepository(realDbClient);
  }

  static createNull(options = {}) {
    const clientOptions = {
      update: (options.update ?? []).map(
        ({ params: [recipeId, recipeInput], response }) => ({
          params: { where: { recipeId }, data: recipeInput },
          response,
        })
      ),

      findUnique: (options.findById ?? []).map(({ params, response }) => ({
        params: { select: selectRecipeProps, where: { recipeId: params } },
        response,
      })),

      findMany: (options.find ?? []).map(({ params, response }) => ({
        params: {
          select: selectRecipeProps,
          where: { name: { contains: params?.name } },
          orderBy: { name: "asc" },
        },
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

  async update(recipeId, recipeInput) {
    this._emitter.emit("update", [recipeId, recipeInput]);
    await this._dbClient.recipe.update({
      where: { recipeId },
      data: recipeInput,
    });
  }

  findById(recipeId) {
    return this._dbClient.recipe.findUnique({
      select: selectRecipeProps,
      where: { recipeId },
    });
  }

  async find(filter = {}) {
    const recipes = await this._dbClient.recipe.findMany({
      select: selectRecipeProps,
      where: { name: { contains: filter.name || undefined } },
      orderBy: { name: "asc" },
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

    update: (params) => {
      const responses = options.update;
      const match = responses.find((response) =>
        equals(response.params, params)
      ) ?? { response: null };

      return match.response instanceof Error
        ? Promise.reject(match.response)
        : Promise.resolve(match.response);
    },

    findUnique: (params) => {
      const responses = options.findUnique;
      const match = responses.find((response) =>
        equals(response.params, params)
      ) ?? { response: null };

      return Promise.resolve(match.response);
    },

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
