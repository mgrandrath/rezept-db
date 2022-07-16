import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  type RecipeInput,
  type AutocompleteAttribute,
  type RecipeId,
} from "./types.js";
import { contentTypes, sendRequest } from "./util/http";
import { urlPath } from "./util/url";

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

export const useRecipe = (recipeId: RecipeId) => {
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

  return useMutation<void, unknown, RecipeInput, unknown>(
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

export const useUpdateRecipe = (recipeId: RecipeId) => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, RecipeInput, unknown>(
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

export const useAutocomplete = (attribute: AutocompleteAttribute) => {
  return useQuery<void, unknown, string[], string[]>(
    ["autocomplete", attribute],
    async () => {
      const response = await sendRequest({
        method: "GET",
        url: urlPath`/api/autocomplete/${attribute}`,
      });

      return response.data;
    }
  );
};
