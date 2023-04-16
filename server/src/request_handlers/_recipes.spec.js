"use strict";

const RecipeRepository = require("../services/recipe_repository.js");
const Services = require("../services/services.js");
const Uuid = require("../services/uuid.js");
const recipes = require("./recipes.js");
const {
  newRecipe,
  newRecipeInput,
  newRequest,
  newRecipeOfflineSource,
  newRecipeSeasons,
} = require("../spec_helper/fixtures");
const {
  sourceTypes,
  diets,
  prepTimes,
  seasons,
  sortOrders,
} = require("../constants");

describe("recipes", () => {
  describe("index", () => {
    it("should return all recipes", async () => {
      const services = Services.createNull({
        recipeRepository: RecipeRepository.createNull({
          find: [
            {
              response: {
                data: [
                  newRecipe({ recipeId: "recipe-111" }),
                  newRecipe({ recipeId: "recipe-222" }),
                ],
              },
            },
          ],
        }),
      });
      const request = newRequest({ query: { page: 1 } });

      const response = await recipes.index(services, request);

      expect(response).toMatchObject({
        data: {
          recipes: [{ recipeId: "recipe-111" }, { recipeId: "recipe-222" }],
        },
      });
    });

    it("should filter recipes", async () => {
      const services = Services.createNull({
        recipeRepository: RecipeRepository.createNull({
          find: [
            {
              params: {
                name: "pizza",
                maxDiet: diets.VEGETARIAN,
                maxPrepTime: prepTimes["30_TO_60_MINUTES"],
                tags: ["cheese", "peperoni"],
                sortBy: sortOrders.createdAt,
              },
              response: {
                data: [newRecipe({ recipeId: "recipe-111" })],
              },
            },
          ],
        }),
      });
      const request = newRequest({
        query: {
          page: 1,
          name: "pizza",
          maxDiet: diets.VEGETARIAN,
          maxPrepTime: prepTimes["30_TO_60_MINUTES"],
          tags: ["cheese", "peperoni"],
          sortBy: sortOrders.createdAt,
        },
      });

      const response = await recipes.index(services, request);

      expect(response).toMatchObject({
        data: {
          recipes: [{ recipeId: "recipe-111" }],
        },
      });
    });

    it("should paginate the result", async () => {
      const numberOfItems = 150;
      const numberOfMatches = 120;
      const numberOfPages = 5; // numberOfMatches / PAGE_SIZE
      const currentPage = 3;
      const expectedOffset = 50; // PAGE_SIZE * (page - 1)
      const expectedLimit = 25; // PAGE_SIZE

      const services = Services.createNull({
        recipeRepository: RecipeRepository.createNull({
          count: [
            {
              params: { name: "pizza" },
              response: numberOfMatches,
            },
            {
              params: {},
              response: numberOfItems,
            },
          ],

          find: [
            {
              params: {
                name: "pizza",
                offset: expectedOffset,
                limit: expectedLimit,
              },
              response: {
                data: [newRecipe({ recipeId: "recipe-111" })],
              },
            },
          ],
        }),
      });
      const request = newRequest({
        query: { page: currentPage, name: "pizza" },
      });

      const response = await recipes.index(services, request);

      expect(response.data).toMatchObject({
        pagination: {
          currentPage,
          numberOfPages,
        },
        filter: {
          numberOfItems,
          numberOfMatches,
        },
        recipes: [{ recipeId: "recipe-111" }],
      });
    });
  });

  describe("show", () => {
    it("should return the recipe with the given id", async () => {
      const recipeId = "recipe-123";
      const recipe = newRecipe({ recipeId });

      const services = Services.createNull({
        recipeRepository: RecipeRepository.createNull({
          findById: [
            {
              params: recipeId,
              response: recipe,
            },
          ],
        }),
      });
      const request = newRequest({ params: { recipeId } });

      const response = await recipes.show(services, request);

      expect(response.status ?? 200).toEqual(200);
      expect(response.data).toEqual(recipe);
    });

    it("should return a 404 error when recipeId does not exist", async () => {
      const recipeId = "recipe-123";

      const services = Services.createNull();
      const request = newRequest({ params: { recipeId } });

      const response = await recipes.show(services, request);

      expect(response.status).toEqual(404);
      expect(response.data).toEqual({
        message: "The given recipeId 'recipe-123' does not exist.",
      });
    });
  });

  describe("create", () => {
    it("should store the given recipe with a generated id", async () => {
      const recipeId = "recipe-111";

      const services = Services.createNull({
        uuid: Uuid.createNull(recipeId),
      });
      const storeCalls = services.recipeRepository.trackCalls("store");
      const request = newRequest({
        data: newRecipeInput({
          name: "Grilled cheese",
          diet: diets.VEGETARIAN,
          prepTime: prepTimes.UNDER_30_MINUTES,
          notes: "American cheese melts best",
          source: newRecipeOfflineSource({
            title: "My Recipe Collection",
            page: "123",
          }),
          seasons: newRecipeSeasons({
            [seasons.SPRING]: true,
            [seasons.SUMMER]: false,
            [seasons.FALL]: false,
            [seasons.WINTER]: true,
          }),
          tags: ["Cheese", "Bread"],
        }),
      });

      await recipes.create(services, request);

      expect(storeCalls).toEqual([
        {
          recipeId,
          name: "Grilled cheese",
          diet: diets.VEGETARIAN,
          prepTime: prepTimes.UNDER_30_MINUTES,
          notes: "American cheese melts best",
          source: {
            type: sourceTypes.OFFLINE,
            title: "My Recipe Collection",
            page: "123",
          },
          seasons: newRecipeSeasons({
            [seasons.SPRING]: true,
            [seasons.SUMMER]: false,
            [seasons.FALL]: false,
            [seasons.WINTER]: true,
          }),
          tags: ["Cheese", "Bread"],
        },
      ]);
    });

    it("should return the recipe's location", async () => {
      const services = Services.createNull({
        uuid: Uuid.createNull("12345"),
      });
      const request = newRequest({
        data: newRecipeInput(),
      });

      const response = await recipes.create(services, request);

      expect(response).toEqual({
        status: 201,
        headers: {
          Location: "/api/recipes/12345",
        },
      });
    });
  });

  describe("update", () => {
    it("should replace the given recipe's data", async () => {
      const recipeId = "recipe-111";
      const recipeInput = newRecipeInput();

      const services = Services.createNull();
      const updateCalls = services.recipeRepository.trackCalls("update");
      const request = newRequest({
        params: { recipeId },
        data: recipeInput,
      });

      const response = await recipes.update(services, request);

      expect(updateCalls).toEqual([[recipeId, recipeInput]]);
      expect(response).toEqual({
        status: 204,
      });
    });

    it("should implement PUT semantics by setting missing optional values to null", async () => {
      const recipeId = "recipe-111";
      const recipeInput = newRecipeInput();
      delete recipeInput.notes;
      const expectedRecipeInput = {
        ...recipeInput,
        notes: null,
      };

      const services = Services.createNull();
      const updateCalls = services.recipeRepository.trackCalls("update");
      const request = newRequest({
        params: { recipeId },
        data: recipeInput,
      });

      await recipes.update(services, request);

      expect(updateCalls).toEqual([[recipeId, expectedRecipeInput]]);
    });

    it("should return a 404 error when recipeId does not exist", async () => {
      const recipeId = "recipe-123";
      const recipeInput = newRecipeInput();

      const services = Services.createNull({
        recipeRepository: RecipeRepository.createNull({
          update: [
            {
              params: [recipeId, recipeInput],
              response: Object.assign(new Error(), {
                meta: { cause: "Record to update not found" },
              }),
            },
          ],
        }),
      });
      const request = newRequest({
        params: { recipeId },
        data: recipeInput,
      });

      const response = await recipes.update(services, request);

      expect(response.status).toEqual(404);
      expect(response.data).toEqual({
        message: "The given recipeId 'recipe-123' does not exist.",
      });
    });
  });
});
