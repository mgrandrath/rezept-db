"use strict";

const RecipeRepository = require("./recipe_repository.js");
const Uuid = require("./uuid.js");

exports.create = () => ({
  uuid: Uuid.create(),
  recipeRepository: RecipeRepository.create(),
});

exports.createNull = (overrides) => ({
  uuid: Uuid.createNull(),
  recipeRepository: RecipeRepository.createNull(),
  ...overrides,
});
