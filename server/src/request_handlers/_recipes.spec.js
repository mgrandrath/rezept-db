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

    it("should filter recipes by title", async () => {
      const services = Services.createNull({
        recipeRepository: RecipeRepository.createNull({
          find: [
            {
              params: { title: "pizza" },
              response: {
                data: [newRecipe({ recipeId: "recipe-111" })],
              },
            },
          ],
        }),
      });
      const request = newRequest({
        query: { title: "pizza" },
      });

      const response = await recipes.index(services, request);

      expect(response).toMatchObject({
        data: {
          recipes: [{ recipeId: "recipe-111" }],
        },
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
          title: "Grilled cheese",
          notes: "American cheese melts best",
        }),
      });

      await recipes.create(services, request);

      expect(storeCalls).toEqual([
        {
          recipeId,
          title: "Grilled cheese",
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
