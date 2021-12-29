"use strict";

const path = require("node:path");
const express = require("express");

const server = express();
server.use(express.static(path.join(__dirname, "..", "..", "client", "build")));
server.listen(9000, () => {
  console.log("Server listening on http://localhost:9000");
});
