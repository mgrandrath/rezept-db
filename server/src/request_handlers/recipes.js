"use strict";

exports.create = async () => {
  return {
    status: 201,
    headers: {
      Location: "http://example.com/recipe-123",
    },
  };
};
