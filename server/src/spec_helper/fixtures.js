"use strict";

const { deepmerge } = require("../util/object.js");

const factory =
  (defaults) =>
  (overrides = {}) =>
    deepmerge(defaults(overrides), overrides);

exports.newRequest = factory(() => ({
  params: {},
  query: {},
  data: null,
}));

exports.newRecipeInput = factory(() => ({
  title: "Default fixture title",
  notes: "Default fixture notes",
}));

let nextRecipeId = 1000000;
exports.newRecipe = factory(() => ({
  recipeId: `recipe-${nextRecipeId++}`,
  title: "Default fixture title",
  notes: "Default fixture notes",
}));
