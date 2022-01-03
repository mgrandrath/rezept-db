"use strict";

const dbClient = require("./db_client.js");

module.exports = class RecipeRepository {
  static create() {
    return new RecipeRepository();
  }

  async store(recipeInput) {
    await dbClient.recipe.create({ data: recipeInput });
  }
};
