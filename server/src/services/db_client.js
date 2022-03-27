"use strict";

const { PrismaClient } = require("@prisma/client");

let dbClient;

module.exports = () => {
  if (!dbClient) {
    dbClient = new PrismaClient();
  }

  return dbClient;
};
