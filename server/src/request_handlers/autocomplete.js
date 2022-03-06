"use strict";

exports.show = async (services, request) => {
  const {
    params: { attribute },
  } = request;

  switch (attribute) {
    case "tag":
      return {
        data: await services.autocompleteRepository.findTags(),
      };

    default:
      return {
        status: 400,
        data: {
          message: `Invalid attribute '${attribute}'`,
        },
      };
  }
};
