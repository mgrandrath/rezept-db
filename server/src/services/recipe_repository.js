"use strict";

const EventEmitter = require("node:events");
const {
  sourceTypes,
  diets,
  prepTimes,
  seasons: { SPRING, SUMMER, FALL, WINTER },
  sortOrders,
  seasons,
} = require("../constants.js");
const { removeUndefinedValues, contains } = require("../util/object.js");
const { trackEvents } = require("../util/track_events.js");
const realDbClient = require("./db_client.js");

const seasonToColName = ([season]) =>
  ({
    [seasons.SPRING]: "seasonsSpring",
    [seasons.SUMMER]: "seasonsSummer",
    [seasons.FALL]: "seasonsFall",
    [seasons.WINTER]: "seasonsWinter",
  }[season]);

module.exports = class RecipeRepository {
  static create() {
    return new RecipeRepository(realDbClient());
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

      findMany: (options.find ?? []).map(
        ({ params: { offset, limit, ...filter } = {}, response }) => ({
          params: removeUndefinedValues({
            select: RecipeRepository.selectRecipeProps,
            where: RecipeRepository.filterToWhereClause(filter),
            orderBy: RecipeRepository.filterToOrderClause(filter),
            skip: offset,
            take: limit,
          }),
          response: response.data.map(RecipeRepository.recipeToRecord),
        })
      ),

      count: (options.count ?? []).map(({ params, response }) => ({
        params: {
          where: RecipeRepository.filterToWhereClause(params),
        },
        response,
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
      seasonsSpring: true,
      seasonsSummer: true,
      seasonsFall: true,
      seasonsWinter: true,
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
    const AND = [];
    const OR = [];

    if (filter.name) {
      AND.push({ name: { contains: filter.name } });
    }

    if (dietSubsets.includes(filter.maxDiet)) {
      const dietIndex = dietSubsets.indexOf(filter.maxDiet);
      AND.push({ diet: { in: dietSubsets.slice(0, dietIndex + 1) } });
    }

    if (prepTimeSubsets.includes(filter.maxPrepTime)) {
      const prepTimeIndex = prepTimeSubsets.indexOf(filter.maxPrepTime);
      AND.push({
        prepTime: { in: prepTimeSubsets.slice(0, prepTimeIndex + 1) },
      });
    }

    filter.tags?.forEach((name) => {
      AND.push({ tags: { some: { name } } });
    });

    const selectedSeasonCols = Object.entries(filter.seasons ?? {})
      .filter(([, isSelected]) => isSelected)
      .map(seasonToColName);
    if (selectedSeasonCols.length > 0 && selectedSeasonCols.length < 4) {
      selectedSeasonCols.forEach((col) => {
        OR.push({ [col]: true });
      });
    }

    return { AND, OR: OR.length > 0 ? OR : undefined };
  }

  static filterToOrderClause(filter = {}) {
    const orderBy = {};
    switch (filter.sortBy ?? sortOrders.NAME) {
      case sortOrders.NAME:
        orderBy.name = "asc";
        break;

      case sortOrders.CREATED_AT:
        orderBy.createdAt = "desc";
        break;
    }
    return orderBy;
  }

  static recordToRecipe(record) {
    const {
      sourceType,
      onlineSourceUrl,
      offlineSourceTitle,
      offlineSourcePage,
      seasonsSpring,
      seasonsSummer,
      seasonsFall,
      seasonsWinter,
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
      seasons: {
        [SPRING]: Boolean(seasonsSpring),
        [SUMMER]: Boolean(seasonsSummer),
        [FALL]: Boolean(seasonsFall),
        [WINTER]: Boolean(seasonsWinter),
      },
      tags: recipe.tags.map(({ name }) => name),
    };
  }

  static recipeToRecord({ source = {}, seasons = {}, ...recipe }) {
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
      seasonsSpring: seasons[SPRING],
      seasonsSummer: seasons[SUMMER],
      seasonsFall: seasons[FALL],
      seasonsWinter: seasons[WINTER],
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
    await this._dbClient.tag.deleteMany({ where: { recipes: { none: {} } } });
  }

  async findById(recipeId) {
    const record = await this._dbClient.recipe.findUnique({
      select: RecipeRepository.selectRecipeProps,
      where: { recipeId },
    });
    return record ? RecipeRepository.recordToRecipe(record) : null;
  }

  async find(params = {}) {
    const { limit, offset, ...filter } = params;
    const recipes = await this._dbClient.recipe.findMany({
      select: RecipeRepository.selectRecipeProps,
      where: RecipeRepository.filterToWhereClause(filter),
      orderBy: RecipeRepository.filterToOrderClause(filter),
      skip: offset,
      take: limit,
    });
    return {
      data: recipes.map(RecipeRepository.recordToRecipe),
    };
  }

  async count(filter) {
    return await this._dbClient.recipe.count({
      where: RecipeRepository.filterToWhereClause(filter),
    });
  }

  trackCalls(methodName) {
    return trackEvents(this._emitter, methodName);
  }
};

const findResponse = (params, responses, defaultResponse) =>
  responses.find((response) => contains(params, response.params)) ??
  defaultResponse;

const newNullDbClient = (options) => ({
  recipe: {
    create: () => Promise.resolve(),

    update: (params) => {
      const match = findResponse(params, options.update, { response: null });

      return match.response instanceof Error
        ? Promise.reject(match.response)
        : Promise.resolve(match.response);
    },

    findUnique: (params) => {
      const match = findResponse(params, options.findUnique, {
        response: null,
      });

      return Promise.resolve(match.response);
    },

    findMany: (params) => {
      const match = findResponse(params, options.findMany, {
        response: [],
      });

      return Promise.resolve(match.response);
    },

    count: (params) => {
      const match = findResponse(params, options.count, {
        response: 0,
      });

      return Promise.resolve(match.response);
    },
  },

  tag: {
    deleteMany: () => Promise.resolve(),
  },
});
