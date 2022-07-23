import { render, waitFor } from "@testing-library/react";
import nock, { type DataMatcherMap } from "nock";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { diets, prepTimes, seasons } from "../constants";
import {
  clickButton,
  clickRadioButton,
  enterNumberValue,
  selectOption,
  enterTextValue,
  setCheckbox,
} from "../spec_helper/dom";
import {
  newRecipeInput,
  newRecipeOfflineSource,
  newRecipeOnlineSource,
} from "../spec_helper/fixtures";
import { ToastContextProvider } from "../toast";
import AddRecipe from "./add_recipe";

describe("<AddRecipe>", () => {
  it("should save a new online recipe", async () => {
    const onlineSource = newRecipeOnlineSource({
      url: "https://example.com/my-recipe",
    });
    const expectedRecipeInput = newRecipeInput({
      name: "Eggs Benedict",
      diet: diets.OMNIVORE,
      prepTime: prepTimes["60_TO_120_MINUTES"],
      notes: "Delicious!",
      source: onlineSource,
      seasons: {
        [seasons.SPRING]: true,
        [seasons.SUMMER]: true,
        [seasons.FALL]: false,
        [seasons.WINTER]: false,
      },
      tags: ["Eggs", "Hollandaise", "Brunch"],
    });

    const nockScope = nock("http://localhost")
      .persist()
      .get(/^\/api\/autocomplete\//)
      .optionally()
      .reply(200, [])
      //
      .post("/api/recipes", expectedRecipeInput as unknown as DataMatcherMap)
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
    enterTextValue("URL", onlineSource.url);
    selectOption("Diet", "Omnivore");
    selectOption("Preperation time", "60—120 minutes");
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

  it("should save a new offline recipe", async () => {
    const offlineSource = newRecipeOfflineSource({
      title: "Cooking For Dummies",
      page: 123,
    });
    const expectedRecipeInput = newRecipeInput({
      name: "Eggs Benedict",
      diet: diets.OMNIVORE,
      prepTime: prepTimes.UNDER_30_MINUTES,
      notes: "Delicious!",
      source: offlineSource,
      seasons: {
        [seasons.SPRING]: false,
        [seasons.SUMMER]: true,
        [seasons.FALL]: true,
        [seasons.WINTER]: true,
      },
      tags: ["Eggs", "Hollandaise", "Brunch"],
    });

    const nockScope = nock("http://localhost")
      .persist()
      .get(/^\/api\/autocomplete\//)
      .optionally()
      .reply(200, [])
      //
      .post("/api/recipes", expectedRecipeInput as unknown as DataMatcherMap)
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
    enterTextValue("Title", offlineSource.title);
    enterNumberValue("Page", offlineSource.page);
    selectOption("Diet", "Omnivore");
    selectOption("Preperation time", "under 30 minutes");
    setCheckbox("Spring", false);
    setCheckbox("Summer", true);
    setCheckbox("Fall", true);
    setCheckbox("Winter", true);
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
