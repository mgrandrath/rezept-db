"use strict";

exports.create = async (services, request) => {
  const recipeId = services.uuid.uuidV4();
  const recipe = {
    ...request.data,
    recipeId,
  };

  await services.recipeRepository.store(recipe);

  return {
    status: 201,
    headers: {
      Location: "http://example.com/recipe-123",
    },
  };
};
