"use strict";

exports.index = async (services, request) => {
  const {
    query: { name, maxDiet, maxPrepTime, tags, seasons, sortBy },
  } = request;

  const result = await services.recipeRepository.find({
    name,
    maxDiet,
    maxPrepTime,
    tags,
    seasons,
    sortBy,
  });

  return {
    data: {
      recipes: result.data,
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
  const { data: recipeInput } = request;

  const recipeId = services.uuid.uuidV4();
  const recipe = {
    ...recipeInput,
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

exports.update = async (services, request) => {
  const {
    params: { recipeId },
    data: recipeInput,
  } = request;

  try {
    await services.recipeRepository.update(recipeId, {
      notes: null,
      ...recipeInput,
    });

    return {
      status: 204,
    };
  } catch (error) {
    if (error.meta?.cause?.match(/Record to update not found/)) {
      return {
        status: 404,
        data: {
          message: `The given recipeId '${recipeId}' does not exist.`,
        },
      };
    }

    throw Object.assign(new Error("Failed to update recipe"), {
      request,
      cause: error,
    });
  }
};
