"use strict";

exports.index = async (services, request) => {
  const recipes = await services.recipeRepository.find({
    title: request.query.title,
  });
  return {
    data: {
      recipes: recipes.data,
    },
  };
};

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
      Location: `/api/recipes/${recipeId}`,
    },
  };
};
