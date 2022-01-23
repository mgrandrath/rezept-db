"use strict";

const path = require("node:path");
const { default: axios } = require("axios");
const ApiServer = require("./api_server.js");

describe("ApiServer", () => {
  it("should route requests to handlers defined in the API spec", async () => {
    const server = new ApiServer({
      apiSpecFilename: path.join(__dirname, "_test_api_spec.yaml"),
      requestHandlerDirectory: path.join(__dirname, "_test_request_handlers"),
    });

    await server.start({ port: 0 });

    try {
      const response = await axios.request({
        method: "get",
        url: `http://localhost:${server.port}/api/echo?message=Hello`,
      });
      expect(response.data).toEqual({ message: "Hello" });
    } finally {
      await server.stop();
    }
  });
});
