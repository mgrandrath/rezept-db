"use strict";

const EventEmitter = require("node:events");
const { sourceTypes, diets, prepTimes } = require("../constants.js");
const { equals } = require("../util/object.js");
const { trackEvents } = require("../util/track_events.js");
const realDbClient = require("./db_client.js");

module.exports = class RecipeRepository {
  static create() {
    return new RecipeRepository(realDbClient);
  }

  static createNull(options = {}) {
    const clientOptions = {
      update: (options.update ?? []).map(
        ({ params: [recipeId, recipeInput], response }) => ({
          params: {
            where: { recipeId },
            data: RecipeRepository.recipeToPrismaUpdate(recipeInput),
          },
          response,
        })
      ),

      findUnique: (options.findById ?? []).map(({ params, response }) => ({
        params: {
          select: RecipeRepository.selectRecipeProps,
          where: { recipeId: params },
        },
        response: RecipeRepository.recipeToRecord(response),
      })),

      findMany: (options.find ?? []).map(({ params, response }) => ({
        params: {
          select: RecipeRepository.selectRecipeProps,
          where: RecipeRepository.filterToWhereClause(params),
          orderBy: { name: "asc" },
        },
        response: response.data.map(RecipeRepository.recipeToRecord),
      })),
    };
    return new RecipeRepository(newNullDbClient(clientOptions));
  }

  static get selectRecipeProps() {
    return {
      recipeId: true,
      name: true,
      diet: true,
      prepTime: true,
      notes: true,
      sourceType: true,
      onlineSourceUrl: true,
      offlineSourceTitle: true,
      offlineSourcePage: true,
      tags: { select: { name: true } },
    };
  }

  static filterToWhereClause(filter = {}) {
    const dietSubsets = [diets.VEGAN, diets.VEGETARIAN];
    const prepTimeSubsets = [
      prepTimes.UNDER_30_MINUTES,
      prepTimes["30_TO_60_MINUTES"],
      prepTimes["60_TO_120_MINUTES"],
    ];
    const where = {};

    if (filter.name) {
      where.name = { contains: filter.name };
    }

    if (dietSubsets.includes(filter.maxDiet)) {
      const dietIndex = dietSubsets.indexOf(filter.maxDiet);
      where.diet = { in: dietSubsets.slice(0, dietIndex + 1) };
    }

    if (prepTimeSubsets.includes(filter.maxPrepTime)) {
      const prepTimeIndex = prepTimeSubsets.indexOf(filter.maxPrepTime);
      where.prepTime = { in: prepTimeSubsets.slice(0, prepTimeIndex + 1) };
    }

    return where;
  }

  static recordToRecipe(record) {
    const {
      sourceType,
      onlineSourceUrl,
      offlineSourceTitle,
      offlineSourcePage,
      ...recipe
    } = record;

    let source;
    switch (sourceType) {
      case null:
        source = undefined;
        break;

      case sourceTypes.ONLINE:
        source = {
          type: sourceTypes.ONLINE,
          url: onlineSourceUrl,
        };
        break;

      case sourceTypes.OFFLINE:
        source = {
          type: sourceTypes.OFFLINE,
          title: offlineSourceTitle,
          page: offlineSourcePage,
        };
        break;

      default:
        throw new Error(`Received unknown source type '${sourceType}'`);
    }

    return {
      ...recipe,
      source,
      tags: recipe.tags.map(({ name }) => name),
    };
  }

  static recipeToRecord({ source = {}, ...recipe }) {
    let dbSource;
    switch (source.type) {
      case undefined:
        dbSource = {
          sourceType: null,
          onlineSourceUrl: null,
          offlineSourceTitle: null,
          offlineSourcePage: null,
        };
        break;

      case sourceTypes.ONLINE:
        dbSource = {
          sourceType: sourceTypes.ONLINE,
          onlineSourceUrl: source.url,
          offlineSourceTitle: null,
          offlineSourcePage: null,
        };
        break;

      case sourceTypes.OFFLINE:
        dbSource = {
          sourceType: sourceTypes.OFFLINE,
          offlineSourceTitle: source.title,
          offlineSourcePage: source.page,
          onlineSourceUrl: null,
        };
        break;

      default:
        throw new Error(`Received unknown source type '${source.type}'`);
    }

    return {
      ...recipe,
      ...dbSource,
      tags: recipe.tags.map((name) => ({ name })),
    };
  }

  static recipeToPrismaCreate(recipe) {
    const record = RecipeRepository.recipeToRecord(recipe);

    return {
      ...record,
      tags: {
        connectOrCreate: record.tags.map(({ name }) => ({
          where: { name },
          create: { name },
        })),
      },
    };
  }

  static recipeToPrismaUpdate(recipe) {
    const prismaCreate = RecipeRepository.recipeToPrismaCreate(recipe);

    return {
      ...prismaCreate,
      tags: {
        set: [],
        connectOrCreate: prismaCreate.tags.connectOrCreate,
      },
    };
  }

  constructor(dbClient) {
    this._dbClient = dbClient;
    this._emitter = new EventEmitter();
  }

  async store(recipe) {
    this._emitter.emit("store", recipe);
    await this._dbClient.recipe.create({
      data: RecipeRepository.recipeToPrismaCreate(recipe),
    });
  }

  async update(recipeId, recipeInput) {
    this._emitter.emit("update", [recipeId, recipeInput]);
    await this._dbClient.recipe.update({
      where: { recipeId },
      data: RecipeRepository.recipeToPrismaUpdate(recipeInput),
    });
  }

  async findById(recipeId) {
    const record = await this._dbClient.recipe.findUnique({
      select: RecipeRepository.selectRecipeProps,
      where: { recipeId },
    });
    return record ? RecipeRepository.recordToRecipe(record) : null;
  }

  async find(filter = {}) {
    const recipes = await this._dbClient.recipe.findMany({
      select: RecipeRepository.selectRecipeProps,
      where: RecipeRepository.filterToWhereClause(filter),
      orderBy: { name: "asc" },
    });
    return {
      data: recipes.map(RecipeRepository.recordToRecipe),
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
