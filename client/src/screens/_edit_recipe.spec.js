const {
  render,
  waitFor,
  screen,
  fireEvent,
} = require("@testing-library/react");
const nock = require("nock");
const { QueryClientProvider, QueryClient } = require("react-query");
const { MemoryRouter, Routes, Route } = require("react-router-dom");
const { newRecipe, newRecipeInput } = require("../spec_helper/fixtures.js");
const { ToastContextProvider } = require("../toast.js");
const { default: EditRecipe } = require("./edit_recipe.js");

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
