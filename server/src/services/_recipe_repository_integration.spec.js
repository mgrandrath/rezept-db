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
  return promisify(exec)("prisma migrate dev", {
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

  it("should find recipes that match filter criteria", async () => {
    const recipeRepository = RecipeRepository.create();

    await recipeRepository.store(
      newRecipe({
        name: "Scrambled eggs",
        tags: ["Eggs"],
        diet: diets.VEGETARIAN,
        prepTime: prepTimes.UNDER_30_MINUTES,
      })
    );
    await recipeRepository.store(
      newRecipe({
        name: "Sunny side up",
        tags: ["Eggs"],
        diet: diets.VEGETARIAN,
      })
    );
    await recipeRepository.store(
      newRecipe({ name: "Eggs Benedict", tags: ["Eggs"], diet: diets.OMNIVORE })
    );
    await recipeRepository.store(
      newRecipe({ name: "Indian curry", diet: diets.VEGETARIAN })
    );

    const result = await recipeRepository.find({
      name: "egg",
      maxDiet: diets.VEGETARIAN,
      maxPrepTime: prepTimes.UNDER_30_MINUTES,
      tags: ["Eggs"],
    });

    expect(result).toMatchObject({ data: [{ name: "Scrambled eggs" }] });
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