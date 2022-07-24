"use strict";

import {
  type Diet,
  type PrepTime,
  type RecipesSortOrder,
  type Season,
  type SourceType,
} from "./types";

type Enum<T extends string> = Readonly<{
  [Subtype in T]: Subtype;
}>;

export const PAGE_SIZE = 25;

export const sourceTypes: Enum<SourceType> = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
};

export const diets: Enum<Diet> = {
  VEGAN: "VEGAN",
  VEGETARIAN: "VEGETARIAN",
  OMNIVORE: "OMNIVORE",
};

export const prepTimes: Enum<PrepTime> = {
  UNDER_30_MINUTES: "UNDER_30_MINUTES",
  "30_TO_60_MINUTES": "30_TO_60_MINUTES",
  "60_TO_120_MINUTES": "60_TO_120_MINUTES",
  OVER_120_MINUTES: "OVER_120_MINUTES",
};

export const seasons: Enum<Season> = {
  SPRING: "SPRING",
  SUMMER: "SUMMER",
  FALL: "FALL",
  WINTER: "WINTER",
};

export const sortOrders: Enum<RecipesSortOrder> = {
  name: "name",
  createdAt: "createdAt",
};
