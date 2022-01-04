"use strict";

const dbClient = require("./db_client.js");
const RecipeRepository = require("./recipe_repository.js");
const { newRecipe } = require("../spec_helper/fixtures.js");

jest.mock("./db_client.js", () => ({
  recipe: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
}));

describe("RecipeRepository", () => {
  describe("store", () => {
    it("should store a recipe in the database", async () => {
      dbClient.recipe.create.mockResolvedValue();
      const recipeRepository = RecipeRepository.create();
      const recipe = newRecipe({
        recipeId: "recipe-111",
        title: "Grilled cheese",
        notes: "American cheese melts best",
      });

      await recipeRepository.store(recipe);

      expect(dbClient.recipe.create).toHaveBeenCalledWith({
        data: recipe,
      });
    });

    describe("null instance", () => {
      it("should not interact with the database", async () => {
        const recipeRepository = RecipeRepository.createNull();

        await recipeRepository.store(newRecipe());

        expect(dbClient.recipe.create).not.toHaveBeenCalled();
      });

      it("should track calls", async () => {
        const recipeRepository = RecipeRepository.createNull();
        const storeCalls = recipeRepository.trackCalls("store");
        const recipe = newRecipe();

        await recipeRepository.store(recipe);

        expect(storeCalls).toEqual([recipe]);
      });
    });
  });

  describe("findAll", () => {
    it("should return all recipes", async () => {
      dbClient.recipe.findMany.mockResolvedValue([
        newRecipe({ recipeId: "recipe-111" }),
        newRecipe({ recipeId: "recipe-222" }),
      ]);
      const recipeRepository = RecipeRepository.create();

      const result = await recipeRepository.findAll();

      expect(result.data).toHaveLength(2);
      expect(result.data).toContainMatchingObject({
        recipeId: "recipe-111",
      });
      expect(result.data).toContainMatchingObject({
        recipeId: "recipe-222",
      });
    });

    describe("null instance", () => {
      it("should return a default response", async () => {
        const recipeRepository = RecipeRepository.createNull();

        const result = await recipeRepository.findAll();

        expect(result.data).toEqual([]);
      });

      it("should return a configurable response", async () => {
        const recipeRepository = RecipeRepository.createNull({
          findAll: [
            {
              response: [
                newRecipe({ recipeId: "recipe-111" }),
                newRecipe({ recipeId: "recipe-222" }),
              ],
            },
          ],
        });

        const result = await recipeRepository.findAll();

        expect(result.data).toMatchObject([
          { recipeId: "recipe-111" },
          { recipeId: "recipe-222" },
        ]);
      });
    });
  });
});
