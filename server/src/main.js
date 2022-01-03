"use strict";

const path = require("node:path");
const ApiServer = require("./api_server/api_server.js");
const Services = require("./services/services.js");

const server = new ApiServer(
  {
    apiSpecFilename: path.join(__dirname, "api_spec.yaml"),
    requestHandlerDirectory: path.join(__dirname, "request_handlers"),
  },
  Services.create()
);

server.start({ port: 9000 }).then(
  () => {
    console.log(`Server listening on port ${server.port}`);
  },
  (error) => {
    console.error(error);
    process.exit(1);
  }
);
