"use strict";

exports.PAGE_SIZE = 25;

exports.sourceTypes = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
};

exports.diets = {
  VEGAN: "VEGAN",
  VEGETARIAN: "VEGETARIAN",
  OMNIVORE: "OMNIVORE",
};

exports.prepTimes = {
  UNDER_30_MINUTES: "UNDER_30_MINUTES",
  "30_TO_60_MINUTES": "30_TO_60_MINUTES",
  "60_TO_120_MINUTES": "60_TO_120_MINUTES",
  OVER_120_MINUTES: "OVER_120_MINUTES",
};

exports.seasons = {
  SPRING: "SPRING",
  SUMMER: "SUMMER",
  FALL: "FALL",
  WINTER: "WINTER",
};

exports.sortOrders = {
  NAME: "name",
  CREATED_AT: "createdAt",
};
