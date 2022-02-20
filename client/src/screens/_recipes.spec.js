import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import nock from "nock";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { diets } from "../constants.js";
import {
  clickButton,
  enterTextValue,
  selectOption,
} from "../spec_helper/dom.js";
import { newRecipe } from "../spec_helper/fixtures.js";
import Recipes from "./recipes.js";

describe("<Recipes>", () => {
  it("should list recipe names", async () => {
    nock("http://localhost")
      .get("/api/recipes")
      .query(true) // ignore actual query
      .reply(200, {
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
      .get("/api/recipes")
      .query(true) // ignore actual query
      .reply(200, {
        recipes: [
          newRecipe({
            name: "Eggs Benedict",
          }),
          newRecipe({
            name: "Deep Dish Pizza",
          }),
        ],
      })

      .get("/api/recipes")
      .query({ name: "eggs", maxDiet: diets.OMNIVORE })
      .reply(200, {
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
    clickButton("Apply filters");

    await waitForElementToBeRemoved(() =>
      screen.queryByText("Deep Dish Pizza")
    );
    await screen.findByText("Eggs Benedict");
  });
});
