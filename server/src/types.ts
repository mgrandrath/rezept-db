export type RecipeId = string & { __type__: "RecipeId" };
export type RecipeName = string;
export type RecipeNotes = string | undefined;
export type Tag = string;
export type Tags = Tag[];

export type Diet = "VEGAN" | "VEGETARIAN" | "OMNIVORE";
export type PrepTime =
  | "UNDER_30_MINUTES"
  | "30_TO_60_MINUTES"
  | "60_TO_120_MINUTES"
  | "OVER_120_MINUTES";
export type AutocompleteAttribute = "tag" | "offlineSourceTitle";
export type SourceType = "ONLINE" | "OFFLINE";

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

export interface RecipeInput {
  name: RecipeName;
  source: RecipeSource;
  diet: Diet;
  prepTime: PrepTime;
  tags: Tags;
  notes: RecipeNotes;
}

export interface Recipe {
  recipeId: RecipeId;
  name: RecipeName;
  source: RecipeSource;
  diet: Diet;
  prepTime: PrepTime;
  tags: Tags;
  notes?: RecipeNotes;
}

export type RecipesSortOrder = "name" | "createdAt";

export interface Request {
  params: Readonly<Record<string, string>>;
  query: Readonly<Record<string, string>>;
  data: {} | null;
}
