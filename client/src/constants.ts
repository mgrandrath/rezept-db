import {
  type Diet,
  type PrepTime,
  type RecipesSortOrder,
  type SourceType,
} from "./types";

type Enum<T extends string> = Readonly<{
  [Subtype in T]: Subtype;
}>;
type Labels<T extends string> = Readonly<Record<T, string>>;

export const sourceTypes: Enum<SourceType> = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
};

export const diets: Enum<Diet> = {
  VEGAN: "VEGAN",
  VEGETARIAN: "VEGETARIAN",
  OMNIVORE: "OMNIVORE",
};

export const dietLabels: Labels<Diet> = {
  VEGAN: "Vegan",
  VEGETARIAN: "Vegetarian",
  OMNIVORE: "Omnivore",
};

export const prepTimes: Enum<PrepTime> = {
  UNDER_30_MINUTES: "UNDER_30_MINUTES",
  "30_TO_60_MINUTES": "30_TO_60_MINUTES",
  "60_TO_120_MINUTES": "60_TO_120_MINUTES",
  OVER_120_MINUTES: "OVER_120_MINUTES",
};

export const prepTimeLabels: Labels<PrepTime> = {
  UNDER_30_MINUTES: "under 30 minutes",
  "30_TO_60_MINUTES": "30—60 minutes",
  "60_TO_120_MINUTES": "60—120 minutes",
  OVER_120_MINUTES: "over 120 minutes",
};

export const sortOrders: Enum<RecipesSortOrder> = {
  name: "name",
  createdAt: "createdAt",
};
