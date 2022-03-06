"use strict";

const dbClient = require("./db_client.js");
const AutocompleteRepository = require("./autocomplete_repository.js");

jest.mock("./db_client.js", () => ({
  tag: {
    findMany: jest.fn(),
  },
}));

describe("AutocompleteRepository", () => {
  describe("findTags", () => {
    it("should return a sorted list of all tags", async () => {
      dbClient.tag.findMany.mockResolvedValue([
        { name: "Curry" },
        { name: "Indian" },
        { name: "Lamb" },
      ]);
      const autocompleteRepository = AutocompleteRepository.create();

      const result = await autocompleteRepository.findTags();

      expect(result).toEqual(["Curry", "Indian", "Lamb"]);
      expect(dbClient.tag.findMany).toHaveBeenCalledWith({
        select: { name: true },
        orderBy: { name: "asc" },
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
});
