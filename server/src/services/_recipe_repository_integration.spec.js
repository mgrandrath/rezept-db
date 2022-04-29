"use strict";

const { exec } = require("node:child_process");
const fs = require("node:fs/promises");
const { promisify } = require("node:util");
const tmp = require("tmp");
const { prepTimes, diets, seasons } = require("../constants.js");
const {
  newRecipe,
  newRecipeSeasons,
  newRecipeOnlineSource,
  newRecipeInput,
} = require("../spec_helper/fixtures.js");
const dbClient = require("./db_client.js");
const RecipeRepository = require("./recipe_repository.js");

jest.mock(
  "./db_client.js",
  () => () => new (require("@prisma/client").PrismaClient)()
);
jest.setTimeout(15000);

const createTempFile = promisify(tmp.file).bind(null, {
  prefix: "rezept-db-test",
});

const initializeDbSchema = (path) => {
  return promisify(exec)("prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: `file:${path}` },
  });
};

describe("RecipeRepository integration", () => {
  let emptyDbSchema;
  let tmpDb;
  let origDbUrl;

  beforeAll(async () => {
    origDbUrl = process.env.DATABASE_URL;
    emptyDbSchema = await createTempFile();
    await initializeDbSchema(emptyDbSchema);
  });

  beforeEach(async () => {
    tmpDb = await createTempFile();
    await fs.copyFile(emptyDbSchema, tmpDb);
    process.env.DATABASE_URL = `file:${tmpDb}`;
  });

  afterEach(async () => {
    await fs.unlink(tmpDb);
    try {
      await fs.unlink(tmpDb + "-journal");
    } catch (error) {
      // journal file does not exist -- it's fine
    }
  });

  afterAll(async () => {
    process.env.DATABASE_URL = origDbUrl;
    await fs.unlink(emptyDbSchema);
    await fs.unlink(emptyDbSchema + "-journal");
  });

  it("should store a recipe in the database and retrieve it by its id", async () => {
    const recipeRepository = RecipeRepository.create();

    const recipeId = "recipe-111";
    const expectedRecipe = newRecipe({
      recipeId,
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

    await recipeRepository.store(expectedRecipe);

    const recipe = await recipeRepository.findById(recipeId);
    expect(recipe).toEqual({
      recipeId,
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
      tags: expect.arrayContaining(["Cheese", "Bread"]),
    });
  });

  it("should find all recipes", async () => {
    const recipeRepository = RecipeRepository.create();

    await recipeRepository.store(newRecipe({ name: "Recipe 1" }));
    await recipeRepository.store(newRecipe({ name: "Recipe 2" }));
    await recipeRepository.store(newRecipe({ name: "Recipe 3" }));

    const result = await recipeRepository.find();

    expect(result).toMatchObject({
      data: [{ name: "Recipe 1" }, { name: "Recipe 2" }, { name: "Recipe 3" }],
    });
  });

  it("should return a slice of matching recipes", async () => {
    const recipeRepository = RecipeRepository.create();

    await recipeRepository.store(newRecipe({ name: "Recipe 1" }));
    await recipeRepository.store(newRecipe({ name: "Recipe 2" }));
    await recipeRepository.store(newRecipe({ name: "Recipe 3" }));
    await recipeRepository.store(newRecipe({ name: "Recipe 4" }));

    const result = await recipeRepository.find({ offset: 1, limit: 2 });

    expect(result).toMatchObject({
      data: [{ name: "Recipe 2" }, { name: "Recipe 3" }],
    });
  });

  it("should find recipes that match filter criteria", async () => {
    const filter = {
      name: "egg",
      maxDiet: diets.VEGETARIAN,
      maxPrepTime: prepTimes.UNDER_30_MINUTES,
      tags: ["Eggs"],
      seasons: {
        [seasons.SPRING]: true,
        [seasons.SUMMER]: false,
        [seasons.FALL]: false,
        [seasons.WINTER]: true,
      },
    };
    const matchingRecipeProps = {
      name: "Eggs Benedict",
      diet: diets.VEGAN,
      prepTime: prepTimes.UNDER_30_MINUTES,
      tags: ["Eggs", "English Muffins"],
      seasons: {
        [seasons.SPRING]: true,
        [seasons.SUMMER]: true,
        [seasons.FALL]: false,
        [seasons.WINTER]: false,
      },
    };

    const recipeRepository = RecipeRepository.create();

    await recipeRepository.store(newRecipe(matchingRecipeProps));
    await recipeRepository.store(
      newRecipe({
        ...matchingRecipeProps,
        name: "Sunny side up",
      })
    );
    await recipeRepository.store(
      newRecipe({
        ...matchingRecipeProps,
        diet: diets.OMNIVORE,
      })
    );
    await recipeRepository.store(
      newRecipe({
        ...matchingRecipeProps,
        prepTime: prepTimes["60_TO_120_MINUTES"],
      })
    );
    await recipeRepository.store(
      newRecipe({
        ...matchingRecipeProps,
        tags: [],
      })
    );
    await recipeRepository.store(
      newRecipe({
        ...matchingRecipeProps,
        seasons: {
          [seasons.SPRING]: false,
          [seasons.SUMMER]: true,
          [seasons.FALL]: true,
          [seasons.WINTER]: false,
        },
      })
    );

    const result = await recipeRepository.find(filter);

    expect(result).toMatchObject({ data: [{ name: "Eggs Benedict" }] });
  });

  it("should count recipes that match filter criteria", async () => {
    const filter = {
      name: "egg",
      maxDiet: diets.VEGETARIAN,
      maxPrepTime: prepTimes.UNDER_30_MINUTES,
      tags: ["Eggs"],
      seasons: {
        [seasons.SPRING]: true,
        [seasons.SUMMER]: false,
        [seasons.FALL]: false,
        [seasons.WINTER]: true,
      },
    };
    const matchingRecipeProps = {
      name: "Eggs Benedict",
      diet: diets.VEGAN,
      prepTime: prepTimes.UNDER_30_MINUTES,
      tags: ["Eggs", "English Muffins"],
      seasons: {
        [seasons.SPRING]: true,
        [seasons.SUMMER]: true,
        [seasons.FALL]: false,
        [seasons.WINTER]: false,
      },
    };

    const recipeRepository = RecipeRepository.create();

    await recipeRepository.store(newRecipe(matchingRecipeProps));
    await recipeRepository.store(
      newRecipe({
        ...matchingRecipeProps,
        name: "Sunny side up",
      })
    );
    await recipeRepository.store(
      newRecipe({
        ...matchingRecipeProps,
        diet: diets.OMNIVORE,
      })
    );
    await recipeRepository.store(
      newRecipe({
        ...matchingRecipeProps,
        prepTime: prepTimes["60_TO_120_MINUTES"],
      })
    );
    await recipeRepository.store(
      newRecipe({
        ...matchingRecipeProps,
        tags: [],
      })
    );
    await recipeRepository.store(
      newRecipe({
        ...matchingRecipeProps,
        seasons: {
          [seasons.SPRING]: false,
          [seasons.SUMMER]: true,
          [seasons.FALL]: true,
          [seasons.WINTER]: false,
        },
      })
    );

    const result = await recipeRepository.count(filter);

    expect(result).toEqual(1);
  });

  it("should update a recipe with the new values", async () => {
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

    await recipeRepository.store(newRecipe({ recipeId }));
    await recipeRepository.update(recipeId, recipeInput);

    const recipe = await recipeRepository.findById(recipeId);
    expect(recipe).toEqual({
      recipeId,
      name: "Grilled cheese",
      prepTime: prepTimes["60_TO_120_MINUTES"],
      diet: diets.VEGETARIAN,
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
      tags: expect.arrayContaining(["Cheese", "Bread"]),
    });
  });

  it("should delete unused tags after update", async () => {
    const tags = () =>
      dbClient()
        .tag.findMany({
          select: { name: true },
        })
        .then((tags) => tags.map(({ name }) => name));

    const recipeRepository = RecipeRepository.create();

    const recipeId = "recipe-111";
    await recipeRepository.store(newRecipe({ recipeId, tags: ["foo", "bar"] }));
    expect(await tags()).toEqual(expect.arrayContaining(["foo", "bar"]));

    await recipeRepository.update(recipeId, newRecipeInput({ tags: ["foo"] }));
    expect(await tags()).toEqual(expect.arrayContaining(["foo"]));
  });
});
