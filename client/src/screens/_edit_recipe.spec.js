import { render, screen, waitFor } from "@testing-library/react";
import nock from "nock";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { paths } from "../paths.js";
import {
  clickButton,
  selectOptionValue,
  enterTextValue,
} from "../spec_helper/dom.js";
import { newRecipe, newRecipeInput } from "../spec_helper/fixtures.js";
import { ToastContextProvider } from "../toast.js";
import { safeGeneratePath } from "../util/url.js";
import EditRecipe from "./edit_recipe.js";

describe("<EditRecipe>", () => {
  it("should update a recipe's data", async () => {
    const expectedRecipeInput = newRecipeInput();

    const nockScope = nock("http://localhost")
      .persist()
      .get("/api/recipes/recipe-123")
      .reply(
        200,
        newRecipe({
          recipeId: "recipe-123",
        })
      )
      //
      .put("/api/recipes/recipe-123", expectedRecipeInput)
      .reply(204);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <ToastContextProvider>
          <MemoryRouter
            initialEntries={[
              safeGeneratePath(paths.editRecipe, { recipeId: "recipe-123" }),
            ]}
          >
            <Routes>
              <Route path={paths.recipe} element={<div />} />
              <Route path={paths.editRecipe} element={<EditRecipe />} />
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
    enterTextValue("Notes", expectedRecipeInput.notes);
    clickButton("Save");

    await waitFor(() => {
      nockScope.done();
    });
  });
});
