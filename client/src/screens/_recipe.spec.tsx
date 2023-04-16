import { render, screen } from "@testing-library/react";
import nock from "nock";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { recipeRoute } from "../routes";
import { newRecipe } from "../spec_helper/fixtures";
import { type RecipeId } from "../types";
import Recipe from "./recipe";

describe("<Recipe>", () => {
  it("should display recipe details", async () => {
    nock("http://localhost")
      .get("/api/recipes/recipe-123")
      .reply(
        200,
        newRecipe({
          recipeId: "recipe-123" as RecipeId,
          name: "Grilled Cheese",
          notes: "American cheese melts best",
        })
      );

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter
          initialEntries={[
            recipeRoute.url({ recipeId: "recipe-123" as RecipeId }),
          ]}
        >
          <Routes>
            <Route path={recipeRoute.route} element={<Recipe />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await screen.findByText("Grilled Cheese");
    await screen.findByText("American cheese melts best");
  });
});