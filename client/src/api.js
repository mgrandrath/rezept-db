import { useMutation, useQuery, useQueryClient } from "react-query";
import { contentTypes, sendRequest } from "./util/http.js";
import { urlPath } from "./util/url.js";

export const useRecipes = (filter = {}) => {
  return useQuery(["recipes", filter], async () => {
    const response = await sendRequest({
      method: "GET",
      url: "/api/recipes",
      query: filter,
    });

    return response.data;
  });
};

export const useRecipe = (recipeId) => {
  return useQuery(["recipe", recipeId], async () => {
    const response = await sendRequest({
      method: "GET",
      url: urlPath`/api/recipes/${recipeId}`,
    });

    return response.data;
  });
};

export const useAddRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (recipeInput) => {
      await sendRequest({
        method: "POST",
        url: "/api/recipes",
        contentType: contentTypes.JSON,
        data: recipeInput,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("recipes");
        queryClient.invalidateQueries("autocomplete");
      },
    }
  );
};

export const useUpdateRecipe = (recipeId) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (recipeInput) => {
      await sendRequest({
        method: "PUT",
        url: urlPath`/api/recipes/${recipeId}`,
        contentType: contentTypes.JSON,
        data: recipeInput,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["recipe", recipeId]);
        queryClient.invalidateQueries("autocomplete");
      },
    }
  );
};

export const useAutocomplete = (attribute) => {
  return useQuery(["autocomplete", attribute], async () => {
    const response = await sendRequest({
      method: "GET",
      url: urlPath`/api/autocomplete/${attribute}`,
    });

    return response.data;
  });
};
