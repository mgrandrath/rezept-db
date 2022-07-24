"use strict";

const mockDbClient = {
  tag: {
    findMany: jest.fn(),
  },
  recipe: {
    findMany: jest.fn(),
  },
};

jest.mock("./db_client.js", () => () => mockDbClient);

const AutocompleteRepository = require("./autocomplete_repository.js");

describe("AutocompleteRepository", () => {
  describe("findTags", () => {
    it("should return a list of all tags", async () => {
      mockDbClient.tag.findMany.mockResolvedValue([
        { name: "Indian" },
        { name: "Lamb" },
        { name: "Curry" },
      ]);
      const autocompleteRepository = AutocompleteRepository.create();

      const result = await autocompleteRepository.findTags();

      expect(result).toEqual(["Indian", "Lamb", "Curry"]);
      expect(mockDbClient.tag.findMany).toHaveBeenCalledWith({
        select: { name: true },
      });
    });

    describe("null instance", () => {
      it("should return a default response", async () => {
        const autocompleteRepository = AutocompleteRepository.createNull();

        const result = await autocompleteRepository.findTags();

        expect(result).toEqual([]);
      });

      it("should return a configurable response", async () => {
        const autocompleteRepository = AutocompleteRepository.createNull({
          findTags: [
            {
              params: {},
              response: ["Curry", "Indian", "Lamb"],
            },
          ],
        });

        const result = await autocompleteRepository.findTags();

        expect(result).toEqual(["Curry", "Indian", "Lamb"]);
      });
    });
  });

  describe("findOfflineSourceTitles", () => {
    it("should return a list of all offline source titles", async () => {
      mockDbClient.recipe.findMany.mockResolvedValue([
        { offlineSourceTitle: "Cooking for Dummies" },
        { offlineSourceTitle: "Indian Cuisine" },
        { offlineSourceTitle: "The American Hamburger Book" },
      ]);
      const autocompleteRepository = AutocompleteRepository.create();

      const result = await autocompleteRepository.findOfflineSourceTitles();

      expect(result).toEqual([
        "Cooking for Dummies",
        "Indian Cuisine",
        "The American Hamburger Book",
      ]);
      expect(mockDbClient.recipe.findMany).toHaveBeenCalledWith({
        select: { offlineSourceTitle: true },
        where: { offlineSourceTitle: { not: null } },
        distinct: ["offlineSourceTitle"],
      });
    });

    describe("null instance", () => {
      it("should return a default response", async () => {
        const autocompleteRepository = AutocompleteRepository.createNull();

        const result = await autocompleteRepository.findOfflineSourceTitles();

        expect(result).toEqual([]);
      });

      it("should return a configurable response", async () => {
        const autocompleteRepository = AutocompleteRepository.createNull({
          findOfflineSourceTitles: [
            {
              params: {},
              response: [
                "Cooking for Dummies",
                "Indian Cuisine",
                "The American Hamburger Book",
              ],
            },
          ],
        });

        const result = await autocompleteRepository.findOfflineSourceTitles();

        expect(result).toEqual([
          "Cooking for Dummies",
          "Indian Cuisine",
          "The American Hamburger Book",
        ]);
      });
    });
  });
});
