import { render, screen } from "@testing-library/react";
import nock from "nock";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { newRecipe } from "../spec_helper/fixtures.js";
import Recipe from "./recipe.js";

describe("<Recipe>", () => {
  it("should display recipe details", async () => {
    nock("http://localhost")
      .get("/api/recipes/recipe-123")
      .reply(
        200,
        newRecipe({
          recipeId: "recipe-123",
          name: "Grilled Cheese",
          notes: "American cheese melts best",
        })
      );

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/recipes/recipe-123"]}>
          <Routes>
            <Route path="/recipes/:recipeId" element={<Recipe />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await screen.findByText("Grilled Cheese");
    await screen.findByText("American cheese melts best");
  });
});
