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
} = require("../spec_helper/fixtures.js");
const { sourceTypes } = require("../constants.js");

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
      const request = newRequest();

      const response = await recipes.index(services, request);

      expect(response).toMatchObject({
        data: {
          recipes: [{ recipeId: "recipe-111" }, { recipeId: "recipe-222" }],
        },
      });
    });

    it("should filter recipes by name", async () => {
      const services = Services.createNull({
        recipeRepository: RecipeRepository.createNull({
          find: [
            {
              params: { name: "pizza" },
              response: {
                data: [newRecipe({ recipeId: "recipe-111" })],
              },
            },
          ],
        }),
      });
      const request = newRequest({
        query: { name: "pizza" },
      });

      const response = await recipes.index(services, request);

      expect(response).toMatchObject({
        data: {
          recipes: [{ recipeId: "recipe-111" }],
        },
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
          notes: "American cheese melts best",
          source: newRecipeOfflineSource({
            name: "My Recipe Collection",
            page: "123",
          }),
        }),
      });

      await recipes.create(services, request);

      expect(storeCalls).toEqual([
        {
          recipeId,
          name: "Grilled cheese",
          notes: "American cheese melts best",
          source: {
            type: sourceTypes.OFFLINE,
            name: "My Recipe Collection",
            page: "123",
          },
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
