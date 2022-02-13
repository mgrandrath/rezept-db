import { render, waitFor } from "@testing-library/react";
import nock from "nock";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  clickButton,
  clickRadioButton,
  enterTextValue,
} from "../spec_helper/dom.js";
import {
  newRecipeInput,
  newRecipeOfflineSource,
  newRecipeOnlineSource,
} from "../spec_helper/fixtures.js";
import { ToastContextProvider } from "../toast.js";
import AddRecipe from "./add_recipe.js";

describe("<AddRecipe>", () => {
  it("should save a new online recipe", async () => {
    const expectedRecipeInput = newRecipeInput({
      name: "Eggs Benedict",
      notes: "Delicious!",
      source: newRecipeOnlineSource({
        url: "https://example.com/my-recipe",
      }),
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

    enterTextValue("Name", expectedRecipeInput.name);
    enterTextValue("URL", expectedRecipeInput.source.url);
    enterTextValue("Notes", expectedRecipeInput.notes);
    clickButton("Save");

    await waitFor(() => {
      nockScope.done();
    });
  });

  it("should save a new offline recipe", async () => {
    const expectedRecipeInput = newRecipeInput({
      name: "Eggs Benedict",
      notes: "Delicious!",
      source: newRecipeOfflineSource({
        name: "Cooking For Dummies",
        page: "123",
      }),
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

    enterTextValue("Name", expectedRecipeInput.name);
    clickRadioButton("Offline");
    enterTextValue("Source Name", expectedRecipeInput.source.name);
    enterTextValue("Page", expectedRecipeInput.source.page);
    enterTextValue("Notes", expectedRecipeInput.notes);
    clickButton("Save");

    await waitFor(() => {
      nockScope.done();
    });
  });
});
