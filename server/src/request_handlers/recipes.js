"use strict";

exports.index = async (services, request) => {
  const recipes = await services.recipeRepository.find({
    name: request.query.name,
  });

  return {
    data: {
      recipes: recipes.data,
    },
  };
};

exports.show = async (services, request) => {
  const {
    params: { recipeId },
  } = request;
  const recipe = await services.recipeRepository.findById(recipeId);

  return recipe
    ? {
        data: recipe,
      }
    : {
        status: 404,
        data: {
          message: `The given recipeId '${recipeId}' does not exist.`,
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
