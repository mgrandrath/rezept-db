"use strict";

const { mapValues } = require("../util/object.js");

const services = {
  uuid: require("./recipe_repository.js"),
  autocompleteRepository: require("./autocomplete_repository.js"),
  recipeRepository: require("./recipe_repository.js"),
};

exports.create = () => mapValues(services, (Class) => Class.create());

exports.createNull = (overrides = {}) => {
  if (
    !Object.keys(overrides).every((key) => Object.keys(services).includes(key))
  ) {
    throw new Error(
      `Services.createNull: Overrides (${Object.keys(
        overrides
      )}) contain invalid key`
    );
  }

  return {
    ...mapValues(services, (Class) => Class.createNull()),
    ...overrides,
  };
};
