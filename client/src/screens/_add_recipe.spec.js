const {
  render,
  screen,
  fireEvent,
  waitFor,
} = require("@testing-library/react");
const nock = require("nock");
const { QueryClientProvider, QueryClient } = require("react-query");
const { ToastContextProvider } = require("../toast.js");
const { default: AddRecipe } = require("./add_recipe.js");

const enterValue = (input, value) => {
  fireEvent.change(input, { target: { value } });
};

describe("AddRecipe", () => {
  it("should save a new recipe", async () => {
    const recipeInput = {
      title: "Eggs Benedict",
      notes: "Delicious!",
    };

    const nockScope = nock("http://localhost")
      .post("/api/recipes", recipeInput)
      .reply(201);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <ToastContextProvider>
          <AddRecipe />
        </ToastContextProvider>
      </QueryClientProvider>
    );

    const titleInput = screen.getByRole("textbox", { name: "Title" });
    const notesInput = screen.getByRole("textbox", { name: "Notes" });
    const submitButton = screen.getByRole("button", { name: "Save" });

    enterValue(titleInput, recipeInput.title);
    enterValue(notesInput, recipeInput.notes);
    fireEvent.click(submitButton);

    await waitFor(() => {
      nockScope.done();
    });
  });
});