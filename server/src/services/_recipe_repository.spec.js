"use strict";

const RecipeRepository = require("./recipe_repository.js");
const {
  newRecipe,
  newRecipeInput,
  newRecipeOnlineSource,
  newRecipeOfflineSource,
  newRecipeSeasons,
} = require("../spec_helper/fixtures.js");
const {
  sourceTypes,
  diets,
  prepTimes,
  seasons,
  sortOrders,
} = require("../constants.js");

const mockDbClient = {
  recipe: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  tag: {
    deleteMany: jest.fn(),
  },
};

jest.mock("./db_client.js", () => () => mockDbClient);

describe("RecipeRepository", () => {
  describe("store", () => {
    it("should store an ONLINE recipe in the database", async () => {
      mockDbClient.recipe.create.mockResolvedValue();
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

      expect(mockDbClient.recipe.create).toHaveBeenCalledWith({
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
      mockDbClient.recipe.create.mockResolvedValue();
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
          page: 123,
        }),
        tags: [],
      });

      await recipeRepository.store(recipe);

      expect(mockDbClient.recipe.create).toHaveBeenCalledWith({
        data: {
          recipeId: "recipe-111",
          name: "Grilled cheese",
          diet: diets.VEGETARIAN,
          prepTime: prepTimes.UNDER_30_MINUTES,
          notes: "American cheese melts best",
          sourceType: sourceTypes.OFFLINE,
          offlineSourceTitle: "My Recipe Collection",
          offlineSourcePage: 123,
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

        expect(mockDbClient.recipe.create).not.toHaveBeenCalled();
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
      mockDbClient.recipe.update.mockResolvedValue();
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

      expect(mockDbClient.recipe.update).toHaveBeenCalledWith({
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
      mockDbClient.recipe.update.mockResolvedValue();
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
          page: 123,
        }),
        tags: [],
      });

      await recipeRepository.update(recipeId, recipeInput);

      expect(mockDbClient.recipe.update).toHaveBeenCalledWith({
        where: { recipeId },
        data: {
          name: "Grilled cheese",
          diet: diets.VEGETARIAN,
          prepTime: prepTimes.UNDER_30_MINUTES,
          notes: "American cheese melts best",
          sourceType: sourceTypes.OFFLINE,
          offlineSourceTitle: "My Recipe Collection",
          offlineSourcePage: 123,
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

    it("should delete unused tags after update", async () => {
      const recipeRepository = RecipeRepository.create();
      const recipeId = "recipe-111";
      const recipeInput = newRecipeInput();

      await recipeRepository.update(recipeId, recipeInput);

      expect(mockDbClient.tag.deleteMany).toHaveBeenCalledWith({
        where: { recipes: { none: {} } },
      });
    });

    describe("null instance", () => {
      it("should not interact with the database", async () => {
        const recipeRepository = RecipeRepository.createNull();

        await recipeRepository.update("irrelevant-id", newRecipe());

        expect(mockDbClient.recipe.update).not.toHaveBeenCalled();
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

      mockDbClient.recipe.findUnique.mockResolvedValue(
        RecipeRepository.recipeToRecord(recipe)
      );
      const recipeRepository = RecipeRepository.create();

      const result = await recipeRepository.findById(recipeId);

      expect(result).toEqual(recipe);
      expect(mockDbClient.recipe.findUnique).toHaveBeenCalledWith({
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

      mockDbClient.recipe.findUnique.mockResolvedValue(
        RecipeRepository.recipeToRecord(recipe)
      );
      const recipeRepository = RecipeRepository.create();

      const result = await recipeRepository.findById(recipeId);

      expect(result).toEqual(recipe);
      expect(mockDbClient.recipe.findUnique).toHaveBeenCalledWith({
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

      mockDbClient.recipe.findUnique.mockResolvedValue(
        RecipeRepository.recipeToRecord(recipe)
      );
      const recipeRepository = RecipeRepository.create();

      const result = await recipeRepository.findById(recipeId);

      expect(result).toEqual(recipe);
      expect(mockDbClient.recipe.findUnique).toHaveBeenCalledWith({
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
      mockDbClient.recipe.findMany.mockResolvedValue([
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
      expect(mockDbClient.recipe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: RecipeRepository.selectRecipeProps,
          where: { AND: [], OR: undefined },
          orderBy: { name: "asc" },
        })
      );
    });

    describe("offset / limit", () => {
      it("should return all results by default", async () => {
        const recipeRepository = RecipeRepository.create();

        await recipeRepository.find();

        expect(mockDbClient.recipe.findMany.mock.calls[0][0].skip).toEqual(
          undefined
        );
        expect(mockDbClient.recipe.findMany.mock.calls[0][0].take).toEqual(
          undefined
        );
      });

      it("should skip / take given amounts of result", async () => {
        const recipeRepository = RecipeRepository.create();

        await recipeRepository.find({ offset: 5, limit: 7 });

        expect(mockDbClient.recipe.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            skip: 5,
            take: 7,
          })
        );
      });
    });

    describe("name", () => {
      it("should filter by name", async () => {
        mockDbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(newRecipe()),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({ name: "pizza" });

        expect(result.data).toHaveLength(1);
        expect(mockDbClient.recipe.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            select: RecipeRepository.selectRecipeProps,
            where: expect.objectContaining({
              AND: expect.arrayContaining([{ name: { contains: "pizza" } }]),
            }),
            orderBy: { name: "asc" },
          })
        );
      });

      it("should not pass in a name filter string when it's blank", async () => {
        mockDbClient.recipe.findMany.mockResolvedValue([]);
        const recipeRepository = RecipeRepository.create();

        await recipeRepository.find({ name: "" });

        expect(
          mockDbClient.recipe.findMany.mock.calls[0][0].where.AND
        ).not.toContainMatchingObject({ name: {} });
      });
    });

    describe("maxDiet", () => {
      it("should return vegan recipes when maxDiet is `VEGAN`", async () => {
        mockDbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(newRecipe()),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({ maxDiet: diets.VEGAN });

        expect(result.data).toHaveLength(1);
        expect(mockDbClient.recipe.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            select: RecipeRepository.selectRecipeProps,
            where: expect.objectContaining({
              AND: expect.arrayContaining([{ diet: { in: [diets.VEGAN] } }]),
            }),
            orderBy: { name: "asc" },
          })
        );
      });

      it("should return vegetarian and vegan recipes when maxDiet is `VEGETARIAN`", async () => {
        mockDbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(newRecipe()),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({
          maxDiet: diets.VEGETARIAN,
        });

        expect(result.data).toHaveLength(1);
        expect(mockDbClient.recipe.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            select: RecipeRepository.selectRecipeProps,
            where: expect.objectContaining({
              AND: expect.arrayContaining([
                { diet: { in: [diets.VEGAN, diets.VEGETARIAN] } },
              ]),
            }),
            orderBy: { name: "asc" },
          })
        );
      });

      it("should return all recipes when maxDiet is `OMNIVORE`", async () => {
        mockDbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(newRecipe()),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({
          maxDiet: diets.OMNIVORE,
        });

        expect(result.data).toHaveLength(1);
        expect(
          mockDbClient.recipe.findMany.mock.calls[0][0].where.AND
        ).not.toContainMatchingObject({ diet: {} });
      });
    });

    describe("maxPrepTime", () => {
      it("should return recipes w/ prepTime 'UNDER_30_MINUTES' when maxPrepTime is 'UNDER_30_MINUTES'", async () => {
        mockDbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(newRecipe()),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({
          maxPrepTime: prepTimes.UNDER_30_MINUTES,
        });

        expect(result.data).toHaveLength(1);
        expect(mockDbClient.recipe.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            select: RecipeRepository.selectRecipeProps,
            where: expect.objectContaining({
              AND: expect.arrayContaining([
                { prepTime: { in: [prepTimes.UNDER_30_MINUTES] } },
              ]),
            }),
            orderBy: { name: "asc" },
          })
        );
      });

      it("should return recipes w/ prepTime up to '60_TO_120_MINUTES' when maxPrepTime is '60_TO_120_MINUTES'", async () => {
        mockDbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(newRecipe()),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({
          maxPrepTime: prepTimes["60_TO_120_MINUTES"],
        });

        expect(result.data).toHaveLength(1);
        expect(mockDbClient.recipe.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            select: RecipeRepository.selectRecipeProps,
            where: expect.objectContaining({
              AND: expect.arrayContaining([
                {
                  prepTime: {
                    in: [
                      prepTimes.UNDER_30_MINUTES,
                      prepTimes["30_TO_60_MINUTES"],
                      prepTimes["60_TO_120_MINUTES"],
                    ],
                  },
                },
              ]),
            }),
            orderBy: { name: "asc" },
          })
        );
      });

      it("should return all recipes when maxPrepTime is `OVER_120_MINUTES`", async () => {
        mockDbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(newRecipe()),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({
          maxPrepTime: prepTimes.OVER_120_MINUTES,
        });

        expect(result.data).toHaveLength(1);
        expect(
          mockDbClient.recipe.findMany.mock.calls[0][0].where.AND
        ).not.toContainMatchingObject({ prepTime: {} });
      });
    });

    describe("tags", () => {
      it("should return recipes that contain all given tags", async () => {
        mockDbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(newRecipe()),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({
          tags: ["Indian", "Lamb", "Curry"],
        });

        expect(result.data).toHaveLength(1);
        expect(mockDbClient.recipe.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            select: RecipeRepository.selectRecipeProps,
            where: expect.objectContaining({
              AND: expect.arrayContaining([
                { tags: { some: { name: "Indian" } } },
                { tags: { some: { name: "Lamb" } } },
                { tags: { some: { name: "Curry" } } },
              ]),
            }),
            orderBy: { name: "asc" },
          })
        );
      });

      it("should return all recipes when tags list is empty", async () => {
        mockDbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(newRecipe()),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({ tags: [] });

        expect(result.data).toHaveLength(1);
        expect(
          mockDbClient.recipe.findMany.mock.calls[0][0].where.AND
        ).not.toContainMatchingObject({ tags: {} });
      });
    });

    describe("seasons", () => {
      it("should return recipes that contain any given seasons", async () => {
        mockDbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(newRecipe()),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({
          seasons: {
            [seasons.SPRING]: true,
            [seasons.SUMMER]: true,
            [seasons.FALL]: false,
            [seasons.WINTER]: false,
          },
        });

        expect(result.data).toHaveLength(1);
        expect(mockDbClient.recipe.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            select: RecipeRepository.selectRecipeProps,
            where: expect.objectContaining({
              OR: [{ seasonsSpring: true }, { seasonsSummer: true }],
            }),
            orderBy: { name: "asc" },
          })
        );
      });

      it("should return all recipes when no season is selected", async () => {
        mockDbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(newRecipe()),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({
          seasons: {
            [seasons.SPRING]: false,
            [seasons.SUMMER]: false,
            [seasons.FALL]: false,
            [seasons.WINTER]: false,
          },
        });

        expect(result.data).toHaveLength(1);
        expect(mockDbClient.recipe.findMany.mock.calls[0][0].where.OR).toEqual(
          undefined
        );
      });

      it("should return all recipes when all seasons are selected", async () => {
        mockDbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(newRecipe()),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({
          seasons: {
            [seasons.SPRING]: true,
            [seasons.SUMMER]: true,
            [seasons.FALL]: true,
            [seasons.WINTER]: true,
          },
        });

        expect(result.data).toHaveLength(1);
        expect(mockDbClient.recipe.findMany.mock.calls[0][0].where.OR).toEqual(
          undefined
        );
      });
    });

    describe("sortBy", () => {
      it("should sort results by name when sortBy is not present", async () => {
        mockDbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(newRecipe()),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({});

        expect(result.data).toHaveLength(1);
        expect(mockDbClient.recipe.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { name: "asc" },
          })
        );
      });

      it("should sort results by name when sortBy is 'name'", async () => {
        mockDbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(newRecipe()),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({
          sortBy: sortOrders.NAME,
        });

        expect(result.data).toHaveLength(1);
        expect(mockDbClient.recipe.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { name: "asc" },
          })
        );
      });

      it("should sort results by createdAt (newest first) when sortBy is 'createdAt'", async () => {
        mockDbClient.recipe.findMany.mockResolvedValue([
          RecipeRepository.recipeToRecord(newRecipe()),
        ]);
        const recipeRepository = RecipeRepository.create();

        const result = await recipeRepository.find({
          sortBy: sortOrders.CREATED_AT,
        });

        expect(result.data).toHaveLength(1);
        expect(mockDbClient.recipe.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { createdAt: "desc" },
          })
        );
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
            {
              params: { tags: ["ONE", "TWO"] },
              response: {
                data: [newRecipe({ recipeId: "recipe-555" })],
              },
            },
            {
              params: { sortBy: sortOrders.CREATED_AT },
              response: {
                data: [newRecipe({ recipeId: "recipe-666" })],
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

        const result4 = await recipeRepository.find({ tags: ["ONE", "TWO"] });
        expect(result4.data).toMatchObject([{ recipeId: "recipe-555" }]);

        const result5 = await recipeRepository.find({
          sortBy: sortOrders.CREATED_AT,
        });
        expect(result5.data).toMatchObject([{ recipeId: "recipe-666" }]);
      });
    });
  });

  describe("count", () => {
    it("should count all recipes when no filter is given", async () => {
      mockDbClient.recipe.count.mockResolvedValue(7);
      const recipeRepository = RecipeRepository.create();

      const result = await recipeRepository.count();

      expect(result).toEqual(7);
      expect(mockDbClient.recipe.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { AND: [], OR: undefined },
        })
      );
    });

    describe("null instance", () => {
      it("should return a default response", async () => {
        const recipeRepository = RecipeRepository.createNull();

        const result = await recipeRepository.count();

        expect(result).toEqual(0);
      });

      it("should return a configurable response", async () => {
        const recipeRepository = RecipeRepository.createNull({
          count: [
            {
              params: {},
              response: 1,
            },
            {
              params: { name: "pizza" },
              response: 2,
            },
            {
              params: { maxDiet: diets.VEGETARIAN },
              response: 3,
            },
            {
              params: { tags: ["ONE", "TWO"] },
              response: 4,
            },
          ],
        });

        const result1 = await recipeRepository.count();
        expect(result1).toEqual(1);

        const result2 = await recipeRepository.count({ name: "pizza" });
        expect(result2).toEqual(2);

        const result3 = await recipeRepository.count({
          maxDiet: diets.VEGETARIAN,
        });
        expect(result3).toEqual(3);

        const result4 = await recipeRepository.count({ tags: ["ONE", "TWO"] });
        expect(result4).toEqual(4);
      });
    });
  });
});
