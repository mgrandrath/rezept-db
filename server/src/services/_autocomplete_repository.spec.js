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
    it("should return a list of all tags", async () => {
      dbClient.tag.findMany.mockResolvedValue([
        { name: "Indian" },
        { name: "Lamb" },
        { name: "Curry" },
      ]);
      const autocompleteRepository = AutocompleteRepository.create();

      const result = await autocompleteRepository.findTags();

      expect(result).toEqual(["Indian", "Lamb", "Curry"]);
      expect(dbClient.tag.findMany).toHaveBeenCalledWith({
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
});
