import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import nock from "nock";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { newRecipe } from "../spec_helper/fixtures.js";
import Recipes from "./recipes.js";

const enterValue = (input, value) => {
  fireEvent.change(input, { target: { value } });
};

describe("Recipes", () => {
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

  it("should filter recipes by name", async () => {
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
      .query({ name: "eggs" })
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

    const nameInput = screen.getByRole("textbox", { name: "Name" });
    const submitButton = screen.getByRole("button", { name: "Apply filters" });

    await screen.findByText("Deep Dish Pizza");

    enterValue(nameInput, "eggs");
    fireEvent.click(submitButton);

    await waitForElementToBeRemoved(() =>
      screen.queryByText("Deep Dish Pizza")
    );
    await screen.findByText("Eggs Benedict");
  });
});
