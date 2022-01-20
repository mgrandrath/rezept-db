import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import nock from "nock";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { newRecipe, newRecipeInput } from "../spec_helper/fixtures.js";
import { ToastContextProvider } from "../toast.js";
import EditRecipe from "./edit_recipe.js";

const enterValue = (input, value) => {
  fireEvent.change(input, { target: { value } });
};

describe("<EditRecipe>", () => {
  it("should update a recipe's data", async () => {
    const expectedRecipeInput = newRecipeInput();

    const nockScope = nock("http://localhost")
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
          <MemoryRouter initialEntries={["/recipes/recipe-123/edit"]}>
            <Routes>
              <Route path="/recipes/:recipeId" element={<div />} />
              <Route path="/recipes/:recipeId/edit" element={<EditRecipe />} />
            </Routes>
          </MemoryRouter>
        </ToastContextProvider>
      </QueryClientProvider>
    );

    const nameInput = await screen.findByRole("textbox", { name: "Name" });
    const notesInput = await screen.findByRole("textbox", { name: "Notes" });
    const submitButton = await screen.findByRole("button", { name: "Save" });

    enterValue(nameInput, expectedRecipeInput.name);
    enterValue(notesInput, expectedRecipeInput.notes);
    fireEvent.click(submitButton);

    await waitFor(() => {
      nockScope.done();
    });
  });
});
