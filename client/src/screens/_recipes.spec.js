import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import nock from "nock";
import { QueryClient, QueryClientProvider } from "react-query";
import { newRecipe } from "../spec_helper/fixtures.js";
import Recipes from "./recipes.js";

const enterValue = (input, value) => {
  fireEvent.change(input, { target: { value } });
};

describe("Recipes", () => {
  it("should list recipe titles", async () => {
    nock("http://localhost")
      .get("/api/recipes")
      .query(true) // ignore actual query
      .reply(200, {
        recipes: [
          newRecipe({
            title: "Eggs Benedict",
          }),
        ],
      });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Recipes />
      </QueryClientProvider>
    );

    await screen.findByText("Eggs Benedict");
  });

  it("should filter recipes by title", async () => {
    nock("http://localhost")
      .get("/api/recipes")
      .query(true) // ignore actual query
      .reply(200, {
        recipes: [
          newRecipe({
            title: "Eggs Benedict",
          }),
          newRecipe({
            title: "Deep Dish Pizza",
          }),
        ],
      })

      .get("/api/recipes")
      .query({ title: "eggs" })
      .reply(200, {
        recipes: [
          newRecipe({
            title: "Eggs Benedict",
          }),
        ],
      });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Recipes />
      </QueryClientProvider>
    );

    const titleInput = screen.getByRole("textbox", { name: "Title" });
    const submitButton = screen.getByRole("button", { name: "Apply filters" });

    await screen.findByText("Deep Dish Pizza");

    enterValue(titleInput, "eggs");
    fireEvent.click(submitButton);

    await waitForElementToBeRemoved(() =>
      screen.queryByText("Deep Dish Pizza")
    );
    await screen.findByText("Eggs Benedict");
  });
});
