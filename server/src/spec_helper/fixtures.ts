"use strict";

import { sourceTypes, diets, prepTimes } from "../constants";
import {
  type Request,
  type OfflineSource,
  type OnlineSource,
  type Recipe,
  type RecipeId,
  type RecipeInput,
} from "../types";
import { deepmerge } from "../util/object";

const factory =
  <T extends object>(defaults: (overrides?: Partial<T>) => T) =>
  (overrides?: Partial<T>) =>
    deepmerge(defaults(overrides), overrides) as T;

export const newRequest = factory<Request>(() => ({
  params: {},
  query: {},
  data: null,
}));

export const newRecipeOnlineSource = factory<OnlineSource>(() => ({
  type: sourceTypes.ONLINE,
  url: "https://fixture.example.com/some-recipe",
}));

export const newRecipeOfflineSource = factory<OfflineSource>(() => ({
  type: sourceTypes.OFFLINE,
  title: "My Fixture Collection",
  page: 42,
}));

export const newRecipeInput = factory<RecipeInput>((overrides) => ({
  name: "Default fixture name",
  diet: diets.VEGAN,
  prepTime: prepTimes["30_TO_60_MINUTES"],
  notes: "Default fixture notes",
  source: overrides?.source ?? newRecipeOnlineSource(),
  tags: [],
}));

let nextRecipeId = 1000000;
export const newRecipe = factory<Recipe>((overrides) => ({
  recipeId: `recipe-${nextRecipeId++}` as RecipeId,
  name: "Default fixture name",
  diet: diets.VEGAN,
  prepTime: prepTimes["30_TO_60_MINUTES"],
  notes: "Default fixture notes",
  source: overrides?.source ?? newRecipeOnlineSource(),
  tags: [],
}));