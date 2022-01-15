import { deepmerge } from "../util/object.js";

const factory =
  (defaults) =>
  (overrides = {}) =>
    deepmerge(defaults(overrides), overrides);

let nextRecipeId = 1000000;
export const newRecipe = factory(() => ({
  recipeId: `recipe-${nextRecipeId++}`,
  name: "Default fixture name",
  notes: "Default fixture notes",
}));
