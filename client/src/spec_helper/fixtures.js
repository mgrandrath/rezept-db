import { diets, sourceTypes } from "../constants.js";
import { deepmerge } from "../util/object.js";

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

export const newRecipeInput = factory((overrides) => ({
  name: "Default fixture name",
  diet: diets.VEGAN,
  notes: "Default fixture notes",
  source: overrides.source ?? newRecipeOnlineSource(),
}));

let nextRecipeId = 1000000;
export const newRecipe = factory((overrides) => ({
  recipeId: `recipe-${nextRecipeId++}`,
  name: "Default fixture name",
  diet: diets.VEGAN,
  notes: "Default fixture notes",
  source: overrides.source ?? newRecipeOnlineSource(),
}));
