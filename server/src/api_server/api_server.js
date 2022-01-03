"use strict";

const path = require("node:path");
const fs = require("node:fs/promises");
const http = require("node:http");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const { middleware: openApiValidator } = require("express-openapi-validator");
const { load: parseYaml } = require("js-yaml");

const CLIENT_DIRECTORY = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "client",
  "build"
);

const loadRequestHandler = (requestHandlerDirectory, route, apiSpec) => {
  const { method, basePath, openApiRoute } = route;
  const apiPath = openApiRoute.substring(basePath.length);
  const { operationId } = apiSpec.paths[apiPath][method.toLowerCase()];
  const [filename, action] = operationId.split(".");
  const moduleFilename = path.join(requestHandlerDirectory, filename);
  const module = require(moduleFilename);
  const handleRequest = module[action];

  if (typeof handleRequest !== "function") {
    throw new Error(
      `Could not find function "${action}" in ${moduleFilename} when trying to route "${method} ${openApiRoute}"`
    );
  }

  return handleRequest;
};

const expressHandler = (handleRequest) => async (httpRequest, httpResponse) => {
  const request = {
    query: httpRequest.query,
    data: httpRequest.body,
    params: httpRequest.params,
  };
  const response = await handleRequest(httpRequest.services, request);

  if (response?.status) {
    httpResponse.status(response.status);
  }

  if (response?.headers) {
    httpResponse.header(response.headers);
  }

  if (response?.data) {
    httpResponse.json(response.data);
  } else {
    httpResponse.end();
  }
};

const resolveOperationHandler = (requestHandlerDirectory, route, apiSpec) => {
  const handleRequest = loadRequestHandler(
    requestHandlerDirectory,
    route,
    apiSpec
  );

  return expressHandler(handleRequest);
};

module.exports = class Server {
  constructor(options, services = {} /* TODO */) {
    this._apiSpecFilename = options.apiSpecFilename;
    this._requestHandlerDirectory = options.requestHandlerDirectory;
    this._services = services;
  }

  get port() {
    return this._httpServer.address().port;
  }

  async start(options) {
    const { port } = options;
    const apiSpecYaml = await fs.readFile(this._apiSpecFilename);
    const apiSpec = parseYaml(apiSpecYaml);

    return new Promise((resolve, reject) => {
      const expressServer = express();

      expressServer.use((httpRequest, httpResponse, next) => {
        httpRequest.services = this._services;
        next();
      });
      expressServer.use("/apidocs", swaggerUi.serve, swaggerUi.setup(apiSpec));
      expressServer.use(
        "/api",
        openApiValidator({
          validateRequests: true,
          validateResponses: true,
          apiSpec: this._apiSpecFilename,
          operationHandlers: {
            basePath: this._requestHandlerDirectory,
            resolver: resolveOperationHandler,
          },
        })
      );
      expressServer.use(express.static(CLIENT_DIRECTORY));
      expressServer.use((httpRequest, httpResponse) => {
        httpResponse.sendFile(path.join(CLIENT_DIRECTORY, "index.html"));
      });

      this._httpServer = http.createServer(expressServer);
      this._httpServer.listen(port, resolve);
      this._httpServer.on("error", reject);
    });
  }

  stop() {
    return new Promise((resolve, reject) => {
      this._httpServer.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
};
