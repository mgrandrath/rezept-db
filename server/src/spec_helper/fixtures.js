"use strict";

const { sourceTypes } = require("../constants.js");
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

exports.newRecipeOnlineSource = factory(() => ({
  type: sourceTypes.ONLINE,
  url: "https://fixture.example.com/some-recipe",
}));

exports.newRecipeOfflineSource = factory(() => ({
  type: sourceTypes.OFFLINE,
  name: "My Fixture Collection",
  page: "42",
}));

exports.newRecipeInput = factory((overrides) => ({
  name: "Default fixture name",
  notes: "Default fixture notes",
  source: overrides?.source ?? exports.newRecipeOnlineSource(),
}));

let nextRecipeId = 1000000;
exports.newRecipe = factory((overrides) => ({
  recipeId: `recipe-${nextRecipeId++}`,
  name: "Default fixture name",
  notes: "Default fixture notes",
  source: overrides?.source ?? exports.newRecipeOnlineSource(),
}));
