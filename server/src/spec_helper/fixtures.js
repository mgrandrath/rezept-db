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
  name: "Default fixture name",
  notes: "Default fixture notes",
}));

let nextRecipeId = 1000000;
exports.newRecipe = factory(() => ({
  recipeId: `recipe-${nextRecipeId++}`,
  name: "Default fixture name",
  notes: "Default fixture notes",
}));
