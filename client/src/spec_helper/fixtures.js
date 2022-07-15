import { diets, prepTimes, seasons, sourceTypes } from "../constants";
import { deepmerge } from "../util/object";

const factory =
  (defaults) =>
  (overrides = {}) =>
    deepmerge(defaults(overrides), overrides);

export const newRecipeOnlineSource = factory(() => ({
  type: sourceTypes.ONLINE,
  url: "https://example.com/default-fixture-source",
}));

export const newRecipeOfflineSource = factory(() => ({
  type: sourceTypes.OFFLINE,
  title: "Default Fixture Source",
  page: 0,
}));

export const newRecipeSeasons = factory(() => ({
  [seasons.SPRING]: false,
  [seasons.SUMMER]: false,
  [seasons.FALL]: false,
  [seasons.WINTER]: false,
}));

export const newRecipeInput = factory((overrides) => ({
  name: "Default fixture name",
  diet: diets.VEGAN,
  prepTime: prepTimes["60_TO_120_MINUTES"],
  notes: "Default fixture notes",
  source: overrides.source ?? newRecipeOnlineSource(),
  seasons: newRecipeSeasons(),
  tags: [],
}));

let nextRecipeId = 1000000;
export const newRecipe = factory((overrides) => ({
  recipeId: `recipe-${nextRecipeId++}`,
  name: "Default fixture name",
  diet: diets.VEGAN,
  prepTime: prepTimes["60_TO_120_MINUTES"],
  notes: "Default fixture notes",
  source: overrides.source ?? newRecipeOnlineSource(),
  seasons: newRecipeSeasons(),
  tags: [],
}));
