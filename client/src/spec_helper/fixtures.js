import { deepmerge } from "../util/object.js";

const factory =
  (defaults) =>
  (overrides = {}) =>
    deepmerge(defaults(overrides), overrides);

let nextRecipeId = 1000000;
export const newRecipe = factory(() => ({
  recipeId: `recipe-${nextRecipeId++}`,
  title: "Default fixture title",
  notes: "Default fixture notes",
}));
