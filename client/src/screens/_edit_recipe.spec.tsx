import { render, screen, waitFor } from "@testing-library/react";
import nock, { type DataMatcherMap } from "nock";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { editRecipeRoute, recipeRoute } from "../routes";
import {
  clickButton,
  selectOptionValue,
  enterTextValue,
} from "../spec_helper/dom";
import { newRecipe, newRecipeInput } from "../spec_helper/fixtures";
import { ToastContextProvider } from "../toast";
import { type RecipeId } from "../types";
import EditRecipe from "./edit_recipe";

describe("<EditRecipe>", () => {
  it("should update a recipe's data", async () => {
    const expectedRecipeInput = newRecipeInput({
      tags: ["foo", "bar"],
    });

    const nockScope = nock("http://localhost")
      .persist()
      .get(/^\/api\/autocomplete\//)
      .optionally()
      .reply(200, [])
      //
      .get("/api/recipes/recipe-123")
      .reply(
        200,
        newRecipe({
          recipeId: "recipe-123" as RecipeId,
        })
      )
      //
      .put(
        "/api/recipes/recipe-123",
        expectedRecipeInput as unknown as DataMatcherMap
      )
      .reply(204);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <ToastContextProvider>
          <MemoryRouter
            initialEntries={[
              editRecipeRoute.url({ recipeId: "recipe-123" as RecipeId }),
            ]}
          >
            <Routes>
              <Route path={recipeRoute.route} element={<div />} />
              <Route path={editRecipeRoute.route} element={<EditRecipe />} />
            </Routes>
          </MemoryRouter>
        </ToastContextProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
    });

    enterTextValue("Name", expectedRecipeInput.name);
    selectOptionValue("Diet", expectedRecipeInput.diet);
    selectOptionValue("Preperation time", expectedRecipeInput.prepTime);
    expectedRecipeInput.tags.forEach((tag) => {
      enterTextValue("Tags", tag);
      clickButton("Add tag");
    });
    enterTextValue("Notes", expectedRecipeInput.notes);
    clickButton("Save");

    await waitFor(() => {
      nockScope.done();
    });
  });
});
