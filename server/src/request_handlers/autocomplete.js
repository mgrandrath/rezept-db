"use strict";

const sortCaseInsensitively = (a, b) => {
  const aLowerCase = a.toLowerCase();
  const bLowerCase = b.toLowerCase();

  if (aLowerCase < bLowerCase) {
    return -1;
  } else if (aLowerCase > bLowerCase) {
    return 1;
  } else {
    return 0;
  }
};

exports.show = async (services, request) => {
  const {
    params: { attribute },
  } = request;

  switch (attribute) {
    case "tag": {
      const tags = await services.autocompleteRepository.findTags();
      return {
        data: tags.sort(sortCaseInsensitively),
      };
    }

    default:
      return {
        status: 400,
        data: {
          message: `Invalid attribute '${attribute}'`,
        },
      };
  }
};
