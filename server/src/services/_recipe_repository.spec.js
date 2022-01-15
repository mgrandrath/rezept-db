"use strict";

const dbClient = require("./db_client.js");
const RecipeRepository = require("./recipe_repository.js");
const { newRecipe } = require("../spec_helper/fixtures.js");

jest.mock("./db_client.js", () => ({
  recipe: {
    create: jest.fn(),
    findUnique: jest.fn(),
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
        name: "Grilled cheese",
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

  describe("findById", () => {
    it("should return a single recipe by its id", async () => {
      const recipeId = "recipe-123";
      const recipe = newRecipe({ recipeId });

      dbClient.recipe.findUnique.mockResolvedValue(recipe);
      const recipeRepository = RecipeRepository.create();

      const result = await recipeRepository.findById(recipeId);

      expect(result).toEqual(recipe);
      expect(dbClient.recipe.findUnique).toHaveBeenCalledWith({
        select: { recipeId: true, name: true, notes: true },
        where: { recipeId },
      });
    });

    describe("null instance", () => {
      it("should return null by default", async () => {
        const recipeRepository = RecipeRepository.createNull();

        const result = await recipeRepository.findById("irrelevant-id");

        expect(result).toEqual(null);
      });

      it("should return a configurable response", async () => {
        const recipeRepository = RecipeRepository.createNull({
          findById: [
            {
              params: "recipe-111",
              response: newRecipe({ recipeId: "recipe-111" }),
            },
            {
              params: "recipe-222",
              response: newRecipe({ recipeId: "recipe-222" }),
            },
          ],
        });

        const result1 = await recipeRepository.findById("recipe-111");
        expect(result1).toMatchObject({ recipeId: "recipe-111" });

        const result2 = await recipeRepository.findById("recipe-222");
        expect(result2).toMatchObject({ recipeId: "recipe-222" });
      });
    });
  });

  describe("find", () => {
    it("should return all recipes when no filter is given", async () => {
      dbClient.recipe.findMany.mockResolvedValue([
        newRecipe({ recipeId: "recipe-111" }),
        newRecipe({ recipeId: "recipe-222" }),
      ]);
      const recipeRepository = RecipeRepository.create();

      const result = await recipeRepository.find();

      expect(result.data).toHaveLength(2);
      expect(result.data).toContainMatchingObject({
        recipeId: "recipe-111",
      });
      expect(result.data).toContainMatchingObject({
        recipeId: "recipe-222",
      });
      expect(dbClient.recipe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: { recipeId: true, name: true, notes: true },
          orderBy: { name: "asc" },
        })
      );
    });

    it("should filter by name", async () => {
      dbClient.recipe.findMany.mockResolvedValue([
        newRecipe({ recipeId: "recipe-111" }),
      ]);
      const recipeRepository = RecipeRepository.create();

      const result = await recipeRepository.find({ name: "pizza" });

      expect(result.data).toHaveLength(1);
      expect(dbClient.recipe.findMany).toHaveBeenCalledWith({
        select: { recipeId: true, name: true, notes: true },
        where: { name: { contains: "pizza" } },
        orderBy: { name: "asc" },
      });
    });

    it("should not pass in a name filter string when it's blank", async () => {
      dbClient.recipe.findMany.mockResolvedValue([]);
      const recipeRepository = RecipeRepository.create();

      await recipeRepository.find({ name: "" });

      expect(
        dbClient.recipe.findMany.mock.calls[0][0]?.where?.name?.contains
      ).toEqual(undefined);
    });

    describe("null instance", () => {
      it("should return a default response", async () => {
        const recipeRepository = RecipeRepository.createNull();

        const result = await recipeRepository.find();

        expect(result.data).toEqual([]);
      });

      it("should return a configurable response", async () => {
        const recipeRepository = RecipeRepository.createNull({
          find: [
            {
              params: {},
              response: {
                data: [
                  newRecipe({ recipeId: "recipe-111" }),
                  newRecipe({ recipeId: "recipe-222" }),
                ],
              },
            },
            {
              params: { name: "pizza" },
              response: {
                data: [newRecipe({ recipeId: "recipe-333" })],
              },
            },
          ],
        });

        const result1 = await recipeRepository.find();
        expect(result1.data).toMatchObject([
          { recipeId: "recipe-111" },
          { recipeId: "recipe-222" },
        ]);

        const result2 = await recipeRepository.find({ name: "pizza" });
        expect(result2.data).toMatchObject([{ recipeId: "recipe-333" }]);
      });
    });
  });
});
