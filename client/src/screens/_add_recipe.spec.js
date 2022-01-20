import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import nock from "nock";
import { QueryClient, QueryClientProvider } from "react-query";
import { newRecipeInput } from "../spec_helper/fixtures.js";
import { ToastContextProvider } from "../toast.js";
import AddRecipe from "./add_recipe.js";

const enterValue = (input, value) => {
  fireEvent.change(input, { target: { value } });
};

describe("<AddRecipe>", () => {
  it("should save a new recipe", async () => {
    const expectedRecipeInput = newRecipeInput({
      name: "Eggs Benedict",
      notes: "Delicious!",
    });

    const nockScope = nock("http://localhost")
      .post("/api/recipes", expectedRecipeInput)
      .reply(201);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <ToastContextProvider>
          <AddRecipe />
        </ToastContextProvider>
      </QueryClientProvider>
    );

    const nameInput = screen.getByRole("textbox", { name: "Name" });
    const notesInput = screen.getByRole("textbox", { name: "Notes" });
    const submitButton = screen.getByRole("button", { name: "Save" });

    enterValue(nameInput, expectedRecipeInput.name);
    enterValue(notesInput, expectedRecipeInput.notes);
    fireEvent.click(submitButton);

    await waitFor(() => {
      nockScope.done();
    });
  });
});
