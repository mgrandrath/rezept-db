"use strict";

const dbClient = require("./db_client.js");
const RecipeRepository = require("./recipe_repository.js");

jest.mock("./db_client.js", () => ({
  recipe: {
    create: jest.fn(),
  },
}));

const newRecipe = () => ({
  recipeId: "recipe-111",
  title: "Grilled cheese",
  notes: "American cheese melts best",
});

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
});
