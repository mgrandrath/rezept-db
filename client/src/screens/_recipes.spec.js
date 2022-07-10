import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import nock from "nock";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { diets, prepTimes, seasons, sortOrders } from "../constants";
import {
  clickButton,
  enterTextValue,
  selectOption,
  setCheckbox,
} from "../spec_helper/dom.js";
import { newRecipe } from "../spec_helper/fixtures.js";
import Recipes from "./recipes.js";

describe("<Recipes>", () => {
  it("should list recipe names", async () => {
    nock("http://localhost")
      .get(/^\/api\/autocomplete\//)
      .optionally()
      .reply(200, [])
      //
      .get("/api/recipes")
      .query(true) // ignore actual query
      .reply(200, {
        pagination: {
          currentPage: 1,
          numberOfPages: 1,
        },
        filter: {
          numberOfItems: 1,
          numberOfMatches: 1,
        },
        recipes: [
          newRecipe({
            name: "Eggs Benedict",
          }),
        ],
      });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <Recipes />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await screen.findByText("Eggs Benedict");
  });

  it("should filter recipes", async () => {
    nock("http://localhost")
      .get(/^\/api\/autocomplete\//)
      .optionally()
      .reply(200, [])
      //
      .get("/api/recipes")
      .query(true) // ignore actual query
      .reply(200, {
        pagination: {
          currentPage: 1,
          numberOfPages: 1,
        },
        filter: {
          numberOfItems: 10,
          numberOfMatches: 2,
        },
        recipes: [
          newRecipe({
            name: "Eggs Benedict",
          }),
          newRecipe({
            name: "Deep Dish Pizza",
          }),
        ],
      })
      //
      .get("/api/recipes")
      .query({
        page: 1,
        name: "eggs",
        maxDiet: diets.OMNIVORE,
        maxPrepTime: prepTimes["30_TO_60_MINUTES"],
        tags: ["delicious", "brunch"],
        seasons: {
          [seasons.SPRING]: false,
          [seasons.SUMMER]: true,
          [seasons.FALL]: true,
          [seasons.WINTER]: false,
        },
        sortBy: sortOrders.NAME,
      })
      .reply(200, {
        pagination: {
          currentPage: 1,
          numberOfPages: 1,
        },
        filter: {
          numberOfItems: 10,
          numberOfMatches: 1,
        },
        recipes: [
          newRecipe({
            name: "Eggs Benedict",
          }),
        ],
      });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <Recipes />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await screen.findByText("Deep Dish Pizza");

    enterTextValue("Name", "eggs");
    selectOption("Diet", "Omnivore");
    selectOption("Maximum preperation time", "60 minutes");
    setCheckbox("Spring", false);
    setCheckbox("Summer", true);
    setCheckbox("Fall", true);
    setCheckbox("Winter", false);

    enterTextValue("Tags", "delicious");
    clickButton("Add tag");
    enterTextValue("Tags", "brunch");
    clickButton("Add tag");

    clickButton("Apply filters");

    await waitForElementToBeRemoved(() =>
      screen.queryByText("Deep Dish Pizza")
    );
    await screen.findByText("Eggs Benedict");
  });
});
