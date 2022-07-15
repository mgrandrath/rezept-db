export type RecipeId = string;
export type RecipeName = string;
export type RecipeNotes = string;
export type Tag = string;
export type Tags = Tag[];

export type Diet = "VEGAN" | "VEGETARIAN" | "OMNIVORE";
export type PrepTime =
  | "UNDER_30_MINUTES"
  | "30_TO_60_MINUTES"
  | "60_TO_120_MINUTES"
  | "OVER_120_MINUTES";
export type AutocompleteAttribute = "tag" | "offlineSourceTitle";

export interface OnlineSource {
  type: "ONLINE";
  url: string;
}

export interface OfflineSource {
  type: "OFFLINE";
  title: string;
  page: number;
}

export type RecipeSource = OnlineSource | OfflineSource;

export interface Seasons {
  SPRING: boolean;
  SUMMER: boolean;
  FALL: boolean;
  WINTER: boolean;
}

export interface RecipeInput {
  name: RecipeName;
  source: RecipeSource;
  diet: Diet;
  prepTime: PrepTime;
  seasons: Seasons;
  tags: Tags;
  notes?: RecipeNotes;
}

export interface Recipe {
  recipeId: RecipeId;
  name: RecipeName;
  source: RecipeSource;
  diet: Diet;
  prepTime: PrepTime;
  seasons: Seasons;
  tags: Tags;
  notes?: RecipeNotes;
}
