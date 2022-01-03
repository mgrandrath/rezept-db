"use strict";

const uuidGenerator = require("uuid");
const Uuid = require("./uuid.js");

jest.mock("uuid", () => {
  return { v4: jest.fn() };
});

describe("Uuid", () => {
  beforeEach(() => {
    uuidGenerator.v4.mockClear();
  });

  describe("uuidV4", () => {
    it("should return a uuid v4", () => {
      uuidGenerator.v4.mockReturnValue("9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d");

      const uuid = Uuid.create();
      const result = uuid.uuidV4();

      expect(result).toEqual("9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d");
    });

    describe("null instance", () => {
      it("should return a given uuid", () => {
        const uuid = Uuid.createNull("1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed");
        const result = uuid.uuidV4();

        expect(result).toEqual("1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed");
      });
      it("should return a default uuid", () => {
        const uuid = Uuid.createNull();
        const result = uuid.uuidV4();

        expect(result).toEqual("00000000-0000-0000-0000-000000000000");
      });
    });
  });
});
