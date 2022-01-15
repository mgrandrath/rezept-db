import axios from "axios";
import { useMutation, useQuery } from "react-query";

export const useRecipes = (filter = {}) => {
  const params = {
    name: filter.name,
  };
  return useQuery(["recipes", params], async () => {
    const response = await axios({
      method: "get",
      url: "/api/recipes",
      params,
    });

    return response.data.recipes;
  });
};

export const useRecipe = (recipeId) => {
  return useQuery(["recipe", recipeId], async () => {
    const response = await axios({
      method: "get",
      url: `/api/recipes/${recipeId}`,
    });

    return response.data;
  });
};

export const useAddRecipe = () => {
  return useMutation(async (recipeInput) => {
    await axios({
      method: "post",
      url: "/api/recipes",
      data: recipeInput,
    });
  });
};
