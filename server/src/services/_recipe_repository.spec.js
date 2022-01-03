"use strict";

const dbClient = require("./db_client.js");
const RecipeRepository = require("./recipe_repository.js");

jest.mock("./db_client.js", () => ({
  recipe: {
    create: jest.fn(),
  },
}));

describe("RecipeRepository", () => {
  it("should save a recipe", async () => {
    dbClient.recipe.create.mockResolvedValue();
    const recipeRepository = RecipeRepository.create();
    const recipeInput = {
      id: "recipe-111",
      title: "Grilled cheese",
      notes: "American cheese melts best",
    };

    await recipeRepository.store(recipeInput);

    expect(dbClient.recipe.create).toHaveBeenCalledWith({ data: recipeInput });
  });
});
