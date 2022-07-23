import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type RecipeInput,
  type AutocompleteAttribute,
  type RecipeId,
  type Recipe,
  type RecipeFilter,
  type FilterMeta,
  type PaginationMeta,
} from "./types.js";
import { contentTypes, sendRequest } from "./util/http";
import { urlPath } from "./util/url";

interface RecipesResponse {
  filter: FilterMeta;
  pagination: PaginationMeta;
  recipes: Recipe[];
}

export const useRecipes = (filter: RecipeFilter = {}) => {
  return useQuery<RecipesResponse, Error>(["recipes", filter], async () => {
    const response = await sendRequest({
      method: "GET",
      url: "/api/recipes",
      query: filter,
    });

    return response.data;
  });
};

export const useRecipe = (recipeId: RecipeId | undefined) => {
  return useQuery<Recipe, Error>(
    ["recipe", recipeId as string],
    async () => {
      const response = await sendRequest({
        method: "GET",
        url: urlPath`/api/recipes/${recipeId as string}`,
      });

      return response.data;
    },
    {
      enabled: recipeId !== undefined,
    }
  );
};

export const useAddRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RecipeInput>(
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
        queryClient.invalidateQueries(["recipes"]);
        queryClient.invalidateQueries(["autocomplete"]);
      },
    }
  );
};

export const useUpdateRecipe = (recipeId: RecipeId) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RecipeInput>(
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
        queryClient.invalidateQueries(["autocomplete"]);
      },
    }
  );
};

export const useAutocomplete = (attribute: AutocompleteAttribute) => {
  return useQuery<string[], Error>(["autocomplete", attribute], async () => {
    const response = await sendRequest({
      method: "GET",
      url: urlPath`/api/autocomplete/${attribute}`,
    });

    return response.data;
  });
};
