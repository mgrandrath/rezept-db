"use strict";

const RecipeRepository = require("../services/recipe_repository.js");
const Services = require("../services/services.js");
const Uuid = require("../services/uuid.js");
const recipes = require("./recipes.js");
const {
  newRecipe,
  newRecipeInput,
  newRequest,
} = require("../spec_helper/fixtures.js");

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
        }),
      });

      await recipes.create(services, request);

      expect(storeCalls).toEqual([
        {
          recipeId,
          name: "Grilled cheese",
          notes: "American cheese melts best",
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
});
