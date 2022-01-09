import axios from "axios";
import { useMutation, useQuery } from "react-query";

export const useRecipes = (filter = {}) => {
  const params = {
    title: filter.title,
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

export const useAddRecipe = () => {
  return useMutation(async (recipeInput) => {
    await axios({
      method: "post",
      url: "/api/recipes",
      data: recipeInput,
    });
  });
};
