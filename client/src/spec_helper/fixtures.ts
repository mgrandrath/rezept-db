import { diets, prepTimes, seasons, sourceTypes } from "../constants";
import {
  type OfflineSource,
  type Recipe,
  type RecipeInput,
  type Seasons,
  type OnlineSource,
} from "../types";
import { deepmerge } from "../util/object";

const factory =
  <T extends object>(defaults: (overrides?: Partial<T>) => T) =>
  (overrides?: Partial<T>) =>
    deepmerge(defaults(overrides), overrides) as T;

export const newRecipeOnlineSource = factory<OnlineSource>(() => ({
  type: sourceTypes.ONLINE,
  url: "https://example.com/default-fixture-source",
}));

export const newRecipeOfflineSource = factory<OfflineSource>(() => ({
  type: sourceTypes.OFFLINE,
  title: "Default Fixture Source",
  page: 0,
}));

export const newRecipeSeasons = factory<Seasons>(() => ({
  [seasons.SPRING]: false,
  [seasons.SUMMER]: false,
  [seasons.FALL]: false,
  [seasons.WINTER]: false,
}));

export const newRecipeInput = factory<RecipeInput>((overrides) => ({
  name: "Default fixture name",
  diet: diets.VEGAN,
  prepTime: prepTimes["60_TO_120_MINUTES"],
  notes: "Default fixture notes",
  source: overrides?.source ?? newRecipeOnlineSource(),
  seasons: newRecipeSeasons(),
  tags: [],
}));

let nextRecipeId = 1000000;
export const newRecipe = factory<Recipe>((overrides) => ({
  recipeId: `recipe-${nextRecipeId++}`,
  name: "Default fixture name",
  diet: diets.VEGAN,
  prepTime: prepTimes["60_TO_120_MINUTES"],
  notes: "Default fixture notes",
  source: overrides?.source ?? newRecipeOnlineSource(),
  seasons: newRecipeSeasons(),
  tags: [],
}));
