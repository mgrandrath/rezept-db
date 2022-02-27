import { render, waitFor } from "@testing-library/react";
import nock from "nock";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { diets, prepTimes, seasons } from "../constants.js";
import {
  clickButton,
  clickRadioButton,
  enterNumberValue,
  selectOption,
  enterTextValue,
  clickCheckbox,
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
      diet: diets.OMNIVORE,
      prepTime: prepTimes["60_TO_120_MINUTES"],
      notes: "Delicious!",
      source: newRecipeOnlineSource({
        url: "https://example.com/my-recipe",
      }),
      seasons: {
        [seasons.SPRING]: true,
        [seasons.SUMMER]: true,
        [seasons.FALL]: false,
        [seasons.WINTER]: false,
      },
      tags: ["Eggs", "Hollandaise", "Brunch"],
    });

    const nockScope = nock("http://localhost")
      .post("/api/recipes", expectedRecipeInput)
      .reply(201);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <ToastContextProvider>
          <MemoryRouter>
            <AddRecipe />
          </MemoryRouter>
        </ToastContextProvider>
      </QueryClientProvider>
    );

    enterTextValue("Name", expectedRecipeInput.name);
    enterTextValue("URL", expectedRecipeInput.source.url);
    selectOption("Diet", "Omnivore");
    selectOption("Preperation time", "60—120 minutes");
    clickCheckbox("Fall");
    clickCheckbox("Winter");
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

  it("should save a new offline recipe", async () => {
    const expectedRecipeInput = newRecipeInput({
      name: "Eggs Benedict",
      diet: diets.OMNIVORE,
      prepTime: prepTimes.UNDER_30_MINUTES,
      notes: "Delicious!",
      source: newRecipeOfflineSource({
        title: "Cooking For Dummies",
        page: 123,
      }),
      seasons: {
        [seasons.SPRING]: false,
        [seasons.SUMMER]: true,
        [seasons.FALL]: true,
        [seasons.WINTER]: true,
      },
      tags: ["Eggs", "Hollandaise", "Brunch"],
    });

    const nockScope = nock("http://localhost")
      .post("/api/recipes", expectedRecipeInput)
      .reply(201);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <ToastContextProvider>
          <MemoryRouter>
            <AddRecipe />
          </MemoryRouter>
        </ToastContextProvider>
      </QueryClientProvider>
    );

    enterTextValue("Name", expectedRecipeInput.name);
    clickRadioButton("Offline");
    enterTextValue("Title", expectedRecipeInput.source.title);
    enterNumberValue("Page", expectedRecipeInput.source.page);
    selectOption("Diet", "Omnivore");
    selectOption("Preperation time", "under 30 minutes");
    clickCheckbox("Spring");
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
