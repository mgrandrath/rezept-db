"use strict";

const Services = require("../services/services.js");
const Uuid = require("../services/uuid.js");
const recipes = require("./recipes.js");

const newRequest = (overrides) => ({
  params: {},
  query: {},
  data: null,
  ...overrides,
});

const newRecipeInput = (overrides) => ({
  title: "Grilles chees",
  notes: "",
  ...overrides,
});

describe("recipes", () => {
  describe("create", () => {
    it("should store the given recipe with a generated id", async () => {
      const recipeId = "recipe-111";

      const services = Services.createNull({
        uuid: Uuid.createNull(recipeId),
      });
      const storeCalls = services.recipeRepository.trackCalls("store");
      const request = newRequest({
        data: newRecipeInput({
          title: "Grilled cheese",
          notes: "American cheese melts best",
        }),
      });

      await recipes.create(services, request);

      expect(storeCalls).toEqual([
        {
          id: recipeId,
          title: "Grilled cheese",
          notes: "American cheese melts best",
        },
      ]);
    });
  });
});
