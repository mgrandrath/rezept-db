import { Season } from "./types";

export const sourceTypes = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
} as const;

export const diets = {
  VEGAN: "VEGAN",
  VEGETARIAN: "VEGETARIAN",
  OMNIVORE: "OMNIVORE",
} as const;

export const dietLabels = {
  VEGAN: "Vegan",
  VEGETARIAN: "Vegetarian",
  OMNIVORE: "Omnivore",
} as const;

export const prepTimes = {
  UNDER_30_MINUTES: "UNDER_30_MINUTES",
  "30_TO_60_MINUTES": "30_TO_60_MINUTES",
  "60_TO_120_MINUTES": "60_TO_120_MINUTES",
  OVER_120_MINUTES: "OVER_120_MINUTES",
} as const;

export const prepTimeLabels = {
  UNDER_30_MINUTES: "under 30 minutes",
  "30_TO_60_MINUTES": "30—60 minutes",
  "60_TO_120_MINUTES": "60—120 minutes",
  OVER_120_MINUTES: "over 120 minutes",
} as const;

export const seasons = {
  SPRING: "SPRING",
  SUMMER: "SUMMER",
  FALL: "FALL",
  WINTER: "WINTER",
} as const;

export const seasonLabels: Readonly<Record<Season, string>> = {
  SPRING: "Spring",
  SUMMER: "Summer",
  FALL: "Fall",
  WINTER: "Winter",
};

export const sortOrders = {
  NAME: "name",
  CREATED_AT: "createdAt",
} as const;
