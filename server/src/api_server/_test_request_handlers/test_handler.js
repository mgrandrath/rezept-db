"use strict";

exports.show = async (services, request) => {
  return {
    data: {
      message: request.query.message,
    },
  };
};
