import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { urlPath } from "./util/url.js";

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
      url: urlPath`/api/recipes/${recipeId}`,
    });

    return response.data;
  });
};

export const useAddRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (recipeInput) => {
      await axios({
        method: "post",
        url: "/api/recipes",
        data: recipeInput,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("recipes");
      },
    }
  );
};

export const useUpdateRecipe = (recipeId) => {
  const queryClient = useQueryClient();

  return useMutation(async (recipeInput) => {
    await axios(
      {
        method: "put",
        url: urlPath`/api/recipes/${recipeId}`,
        data: recipeInput,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["recipe", recipeId]);
        },
      }
    );
  });
};
