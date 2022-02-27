"use strict";

const dbClient = require("./db_client.js");
const RecipeRepository = require("./recipe_repository.js");
const {
  newRecipe,
  newRecipeInput,
  newRecipeOnlineSource,
  newRecipeOfflineSource,
  newRecipeSeasons,
} = require("../spec_helper/fixtures.js");
const { sourceTypes, diets, prepTimes, seasons } = require("../constants.js");

jest.mock("./db_client.js", () => ({
  recipe: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
}));

describe("RecipeRepository", () => {
  describe("store", () => {
    it("should store an ONLINE recipe in the database", async () => {
      dbClient.recipe.create.mockResolvedValue();
      const recipeRepository = RecipeRepository.create();
      const recipe = newRecipe({
        recipeId: "recipe-111",
        name: "Grilled cheese",
        prepTime: prepTimes.UNDER_30_MINUTES,
        diet: diets.VEGETARIAN,
        seasons: newRecipeSeasons({
          [seasons.SPRING]: true,
          [seasons.SUMMER]: true,
          [seasons.FALL]: false,
          [seasons.WINTER]: false,
        }),
        notes: "American cheese melts best",
        source: newRecipeOnlineSource({
          url: "https://example.com/path/to/some-recipe",
        }),
        tags: ["Cheese", "Bread"],
      });

      await recipeRepository.store(recipe);

      expect(dbClient.recipe.create).toHaveBeenCalledWith({
        data: {
          recipeId: "recipe-111",
          name: "Grilled cheese",
          diet: diets.VEGETARIAN,
          prepTime: prepTimes.UNDER_30_MINUTES,
          notes: "American cheese melts best",
          sourceType: sourceTypes.ONLINE,
          onlineSourceUrl: "https://example.com/path/to/some-recipe",
          offlineSourceTitle: null,
          offlineSourcePage: null,
          seasonsSpring: true,
          seasonsSummer: true,
          seasonsFall: false,
          seasonsWinter: false,
          tags: {
            connectOrCreate: [
              { where: { name: "Cheese" }, create: { name: "Cheese" } },
              { where: { name: "Bread" }, create: { name: "Bread" } },
            ],
          },
        },
      });
    });

    it("should store an OFFLINE recipe in the database", async () => {
      dbClient.recipe.create.mockResolvedValue();
      const recipeRepository = RecipeRepository.create();
      const recipe = newRecipe({
        recipeId: "recipe-111",
        name: "Grilled cheese",
        diet: diets.VEGETARIAN,
        prepTime: prepTimes.UNDER_30_MINUTES,
        seasons: newRecipeSeasons({
          [seasons.SPRING]: false,
          [seasons.SUMMER]: false,
          [seasons.FALL]: true,
          [seasons.WINTER]: true,
        }),
        notes: "American cheese melts best",
        source: newRecipeOfflineSource({
          title: "My Recipe Collection",
          page: "123",
        }),
        tags: [],
      });

      await recipeRepository.store(recipe);

      expect(dbClient.recipe.create).toHaveBeenCalledWith({
        data: {
          recipeId: "recipe-111",
          name: "Grilled cheese",
          diet: diets.VEGETARIAN,
          prepTime: prepTimes.UNDER_30_MINUTES,
          notes: "American cheese melts best",
          sourceType: sourceTypes.OFFLINE,
          offlineSourceTitle: "My Recipe Collection",
          offlineSourcePage: "123",
          onlineSourceUrl: null,
          seasonsSpring: false,
          seasonsSummer: false,
          seasonsFall: true,
          seasonsWinter: true,
          tags: {
            connectOrCreate: [],
          },
        },
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

  describe("update", () => {
    it("should update the given ONLINE recipe with the new values", async () => {
      dbClient.recipe.update.mockResolvedValue();
      const recipeRepository = RecipeRepository.create();
      const recipeId = "recipe-111";
      const recipeInput = newRecipeInput({
        name: "Grilled cheese",
        diet: diets.VEGETARIAN,
        prepTime: prepTimes["60_TO_120_MINUTES"],
        seasons: newRecipeSeasons({
          [seasons.SPRING]: false,
          [seasons.SUMMER]: false,
          [seasons.FALL]: true,
          [seasons.WINTER]: true,
        }),
        notes: "American cheese melts best",
        source: newRecipeOnlineSource({
          url: "https://example.com/path/to/some-recipe",
        }),
        tags: ["Cheese", "Bread"],
      });

      await recipeRepository.update(recipeId, recipeInput);

      expect(dbClient.recipe.update).toHaveBeenCalledWith({
        where: { recipeId },
        data: {
          name: "Grilled cheese",
          diet: diets.VEGETARIAN,
          prepTime: prepTimes["60_TO_120_MINUTES"],
          notes: "American cheese melts best",
          sourceType: sourceTypes.ONLINE,
          onlineSourceUrl: "https://example.com/path/to/some-recipe",
          offlineSourceTitle: null,
          offlineSourcePage: null,
          seasonsSpring: false,
          seasonsSummer: false,
          seasonsFall: true,
          seasonsWinter: true,
          tags: {
            set: [],
            connectOrCreate: [
              { where: { name: "Cheese" }, create: { name: "Cheese" } },
              { where: { name: "Bread" }, create: { name: "Bread" } },
            ],
          },
        },
      });
    });

    it("should update the given OFFLINE recipe with the new values", async () => {
      dbClient.recipe.update.mockResolvedValue();
      const recipeRepository = RecipeRepository.create();
      const recipeId = "recipe-111";
      const recipeInput = newRecipeInput({
        name: "Grilled cheese",
        diet: diets.VEGETARIAN,
        prepTime: prepTimes.UNDER_30_MINUTES,
        seasons: newRecipeSeasons({
          [seasons.SPRING]: true,
          [seasons.SUMMER]: false,
          [seasons.FALL]: false,
          [seasons.WINTER]: true,
        }),
        notes: "American cheese melts best",
        source: newRecipeOfflineSource({
          title: "My Recipe Collection",
          page: "123",
        }),
        tags: [],
      });

      await recipeRepository.update(recipeId, recipeInput);

      expect(dbClient.recipe.update).toHaveBeenCalledWith({
        where: { recipeId },
        data: {
          name: "Grilled cheese",
          diet: diets.VEGETARIAN,
          prepTime: prepTimes.UNDER_30_MINUTES,
          notes: "American cheese melts best",
          sourceType: sourceTypes.OFFLINE,
          offlineSourceTitle: "My Recipe Collection",
          offlineSourcePage: "123",
          onlineSourceUrl: null,
          seasonsSpring: true,
          seasonsSummer: false,
          seasonsFall: false,
          seasonsWinter: true,
          tags: {
            set: [],
            connectOrCreate: [],
          },
        },
      });
    });

    describe("null instance", () => {
      it("should not interact with the database", async () => {
        const recipeRepository = RecipeRepository.createNull();

        await recipeRepository.update("irrelevant-id", newRecipe());

        expect(dbClient.recipe.update).not.toHaveBeenCalled();
      });

      it("should track calls", async () => {
        const recipeRepository = RecipeRepository.createNull();
        const updateCalls = recipeRepository.trackCalls("update");
        const recipeId = "recipe-111";
        const recipeInput = newRecipeInput();

        await recipeRepository.update(recipeId, recipeInput);

        expect(updateCalls).toEqual([[recipeId, recipeInput]]);
      });

      it("can be configured to throw an error", async () => {
        const recipeId = "recipe-111";
        const recipeInput = newRecipeInput();

        const recipeRepository = RecipeRepository.createNull({
          update: [
            {
              params: [recipeId, recipeInput],
              response: new Error("Some error"),
            },
          ],
        });

        await expect(
          recipeRepository.update(recipeId, recipeInput)
        ).rejects.toMatchObject({ message: "Some error" });
      });
    });
  });

  describe("findById", () => {
    it("should return a single ONLINE recipe by its id", async () => {
      const recipeId = "recipe-123";
      const recipe = newRecipe({
        recipeId,
        source: newRecipeOnlineSource(),
        tags: ["Cheese", "Bread"],
      });

      dbClient.recipe.findUnique.mockResolvedValue(
        RecipeRepository.recipeToRecord(recipe)
      );
      const recipeRepository = RecipeRepository.create();

      const result = await recipeRepository.findById(recipeId);

      expect(result).toEqual(recipe);
      expect(dbClient.recipe.findUnique).toHaveBeenCalledWith({
        select: RecipeRepository.selectRecipeProps,
        where: { recipeId },
      });
    });

    it("should return a single OFFLINE recipe by its id", async () => {
      const recipeId = "recipe-123";
      const recipe = newRecipe({
        recipeId,
        source: newRecipeOfflineSource(),
      });

      dbClient.recipe.findUnique.mockResolvedValue(
        RecipeRepository.recipeToRecord(recipe)
      );
      const recipeRepository = RecipeRepository.create();

      const result = await recipeRepository.findById(recipeId);

      expect(result).toEqual(recipe);
      expect(dbClient.recipe.findUnique).toHaveBeenCalledWith({
        select: RecipeRepository.selectRecipeProps,
        where: { recipeId },
      });
    });

    it("should return a single recipe w/o source by its id", async () => {
      const recipeId = "recipe-123";
      const recipe = newRecipe({
        recipeId,
      });
      recipe.source = undefined;

      dbClient.recipe.findUnique.mockResolvedValue(
        RecipeRepository.recipeToRecord(recipe)
      );
      const recipeRepository = RecipeRepository.create();

      const result = await recipeRepository.findById(recipeId);

      expect(result).toEqual(recipe);
      expect(dbClient.recipe.findUnique).toHaveBeenCalledWith({
        select: RecipeRepository.selectRecipeProps,
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
        RecipeRepository.recipeToRecord(
          newRecipe({ recipeId: "recipe-111", source: newRecipeOnlineSource() })
        ),
        RecipeRepository.recipeToRecord(
          newRecipe({
            recipeId: "recipe-222",
            source: newRecipeOfflineSource(),
          })
        ),
      ]);
      const recipeRepository = RecipeRepository.create();

      const result = await recipeRepository.find();

      expect(result.data).toHaveLength(2);
      expect(result.data).toContainMatchingObject({
        recipeId: "recipe-111",
        source: {
          type: sourceTypes.ONLINE,
        },
      });
      expect(result.data).toContainMatchingObject({
        recipeId: "recipe-222",
        source: {
          type: sourceTypes.OFFLINE,
        },
      });
      expect(dbClient.recipe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: RecipeRepository.selectRecipeProps,
          orderBy: { name: "asc" },
        })
      );
    });

    describe("name", () => {
      it("should filter by name", async () => {
        dbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(
            newRecipe({ recipeId: "recipe-111" })
          ),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({ name: "pizza" });

        expect(result.data).toHaveLength(1);
        expect(dbClient.recipe.findMany).toHaveBeenCalledWith({
          select: RecipeRepository.selectRecipeProps,
          where: { name: { contains: "pizza" } },
          orderBy: { name: "asc" },
        });
      });

      it("should not pass in a name filter string when it's blank", async () => {
        dbClient.recipe.findMany.mockResolvedValue([]);
        const recipeRepository = RecipeRepository.create();

        await recipeRepository.find({ name: "" });

        expect(
          dbClient.recipe.findMany.mock.calls[0][0].where?.name?.contains
        ).toEqual(undefined);
      });
    });

    describe("maxDiet", () => {
      it("should return vegan recipes when maxDiet is `VEGAN`", async () => {
        dbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(
            newRecipe({ recipeId: "recipe-111" })
          ),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({ maxDiet: diets.VEGAN });

        expect(result.data).toHaveLength(1);
        expect(dbClient.recipe.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            select: RecipeRepository.selectRecipeProps,
            where: { diet: { in: [diets.VEGAN] } },
            orderBy: { name: "asc" },
          })
        );
      });

      it("should return vegetarian and vegan recipes when maxDiet is `VEGETARIAN`", async () => {
        dbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(
            newRecipe({ recipeId: "recipe-111" })
          ),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({
          maxDiet: diets.VEGETARIAN,
        });

        expect(result.data).toHaveLength(1);
        expect(dbClient.recipe.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            select: RecipeRepository.selectRecipeProps,
            where: { diet: { in: [diets.VEGAN, diets.VEGETARIAN] } },
            orderBy: { name: "asc" },
          })
        );
      });

      it("should return all recipes when maxDiet is `OMNIVORE`", async () => {
        dbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(
            newRecipe({ recipeId: "recipe-111" })
          ),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({
          maxDiet: diets.OMNIVORE,
        });

        expect(result.data).toHaveLength(1);
        expect(dbClient.recipe.findMany.mock.calls[0][0].where?.diet).toEqual(
          undefined
        );
      });
    });

    describe("maxPrepTime", () => {
      it("should return recipes w/ prepTime 'UNDER_30_MINUTES' when maxPrepTime is 'UNDER_30_MINUTES'", async () => {
        dbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(
            newRecipe({ recipeId: "recipe-111" })
          ),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({
          maxPrepTime: prepTimes.UNDER_30_MINUTES,
        });

        expect(result.data).toHaveLength(1);
        expect(dbClient.recipe.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            select: RecipeRepository.selectRecipeProps,
            where: { prepTime: { in: [prepTimes.UNDER_30_MINUTES] } },
            orderBy: { name: "asc" },
          })
        );
      });

      it("should return recipes w/ prepTime up to '60_TO_120_MINUTES' when maxPrepTime is '60_TO_120_MINUTES'", async () => {
        dbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(
            newRecipe({ recipeId: "recipe-111" })
          ),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({
          maxPrepTime: prepTimes["60_TO_120_MINUTES"],
        });

        expect(result.data).toHaveLength(1);
        expect(dbClient.recipe.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            select: RecipeRepository.selectRecipeProps,
            where: {
              prepTime: {
                in: [
                  prepTimes.UNDER_30_MINUTES,
                  prepTimes["30_TO_60_MINUTES"],
                  prepTimes["60_TO_120_MINUTES"],
                ],
              },
            },
            orderBy: { name: "asc" },
          })
        );
      });

      it("should return all recipes when maxPrepTime is `OVER_120_MINUTES`", async () => {
        dbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(
            newRecipe({ recipeId: "recipe-111" })
          ),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({
          maxPrepTime: prepTimes.OVER_120_MINUTES,
        });

        expect(result.data).toHaveLength(1);
        expect(
          dbClient.recipe.findMany.mock.calls[0][0].where?.prepTime
        ).toEqual(undefined);
      });
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
            {
              params: { maxDiet: diets.VEGETARIAN },
              response: {
                data: [newRecipe({ recipeId: "recipe-444" })],
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

        const result3 = await recipeRepository.find({
          maxDiet: diets.VEGETARIAN,
        });
        expect(result3.data).toMatchObject([{ recipeId: "recipe-444" }]);
      });
    });
  });
});
