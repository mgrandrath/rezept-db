import { useParams } from "react-router-dom";
import { RecipeId } from "./types";
import { safeGeneratePath } from "./util/url";

interface Path<Params extends Record<string, string>> {
  route: string;
  url: (params: Readonly<Params>) => string;
  useParams: () => Params;
}

export const addRecipeRoute: Path<{}> = {
  route: "/add-recipe",
  url: () => addRecipeRoute.route,
  useParams: () => ({}),
};

export const recipesRoute: Path<{}> = {
  route: "/recipes",
  url: () => recipesRoute.route,
  useParams: () => ({}),
};

type RecipeParams = {
  recipeId: RecipeId;
};

export const recipeRoute: Path<RecipeParams> = {
  route: "/recipes/:recipeId",
  url: (params) => safeGeneratePath(recipeRoute.route, params),
  useParams: () => useParams() as RecipeParams,
};

type EditRecipeParams = {
  recipeId: RecipeId;
};

export const editRecipeRoute: Path<EditRecipeParams> = {
  route: "/recipes/:recipeId/edit",
  url: (params) => safeGeneratePath(editRecipeRoute.route, params),
  useParams: () => useParams() as EditRecipeParams,
};
