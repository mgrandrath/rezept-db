import { render, screen, waitFor } from "@testing-library/react";
import nock, { type DataMatcherMap } from "nock";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { seasons } from "../constants";
import { paths } from "../paths";
import {
  clickButton,
  selectOptionValue,
  enterTextValue,
  setCheckbox,
} from "../spec_helper/dom";
import { newRecipe, newRecipeInput } from "../spec_helper/fixtures";
import { ToastContextProvider } from "../toast";
import { safeGeneratePath } from "../util/url";
import EditRecipe from "./edit_recipe";

describe("<EditRecipe>", () => {
  it("should update a recipe's data", async () => {
    const expectedRecipeInput = newRecipeInput({
      seasons: {
        [seasons.SPRING]: true,
        [seasons.SUMMER]: true,
        [seasons.FALL]: false,
        [seasons.WINTER]: false,
      },
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
          recipeId: "recipe-123",
          seasons: {
            [seasons.SPRING]: false,
            [seasons.SUMMER]: false,
            [seasons.FALL]: false,
            [seasons.WINTER]: false,
          },
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
    selectOptionValue("Preperation time", expectedRecipeInput.prepTime);
    setCheckbox("Spring", true);
    setCheckbox("Summer", true);
    setCheckbox("Fall", false);
    setCheckbox("Winter", false);
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
