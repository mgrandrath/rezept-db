"use strict";

const AutocompleteRepository = require("../services/autocomplete_repository.js");
const Services = require("../services/services.js");
const { newRequest } = require("../spec_helper/fixtures");
const autocomplete = require("./autocomplete.js");

describe("autocomplete", () => {
  describe("show", () => {
    describe("tag", () => {
      it("should return a sorted list of tags", async () => {
        const services = Services.createNull({
          autocompleteRepository: AutocompleteRepository.createNull({
            findTags: [
              {
                params: {},
                response: ["Indian", "Lamb", "Curry"],
              },
            ],
          }),
        });
        const request = newRequest({ params: { attribute: "tag" } });

        const response = await autocomplete.show(services, request);

        expect(response.data).toEqual(["Curry", "Indian", "Lamb"]);
      });

      it("should sort the list of tags case insensitively", async () => {
        const services = Services.createNull({
          autocompleteRepository: AutocompleteRepository.createNull({
            findTags: [
              {
                params: {},
                response: ["indian", "Lamb", "curry"],
              },
            ],
          }),
        });
        const request = newRequest({ params: { attribute: "tag" } });

        const response = await autocomplete.show(services, request);

        expect(response.data).toEqual(["curry", "indian", "Lamb"]);
      });
    });

    describe("offlineSourceTitle", () => {
      it("should return a sorted list of offline source titles", async () => {
        const services = Services.createNull({
          autocompleteRepository: AutocompleteRepository.createNull({
            findOfflineSourceTitles: [
              {
                params: {},
                response: [
                  "The American Hamburger Book",
                  "Cooking for Dummies",
                  "Indian Cuisine",
                ],
              },
            ],
          }),
        });
        const request = newRequest({
          params: { attribute: "offlineSourceTitle" },
        });

        const response = await autocomplete.show(services, request);

        expect(response.data).toEqual([
          "Cooking for Dummies",
          "Indian Cuisine",
          "The American Hamburger Book",
        ]);
      });

      it("should sort the list of tags case insensitively", async () => {
        const services = Services.createNull({
          autocompleteRepository: AutocompleteRepository.createNull({
            findOfflineSourceTitles: [
              {
                params: {},
                response: [
                  "the American Hamburger Book",
                  "cooking for Dummies",
                  "Indian Cuisine",
                ],
              },
            ],
          }),
        });
        const request = newRequest({
          params: { attribute: "offlineSourceTitle" },
        });

        const response = await autocomplete.show(services, request);

        expect(response.data).toEqual([
          "cooking for Dummies",
          "Indian Cuisine",
          "the American Hamburger Book",
        ]);
      });
    });
  });
});
