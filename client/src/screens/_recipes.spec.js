import { render, screen } from "@testing-library/react";
import nock from "nock";
import { QueryClient, QueryClientProvider } from "react-query";
import { newRecipe } from "../spec_helper/fixtures.js";
import Recipes from "./recipes.js";

describe("Recipes", () => {
  it("should list recipe titles", async () => {
    nock("http://localhost")
      .get("/api/recipes")
      .reply(200, {
        recipes: [
          newRecipe({
            title: "Eggs Benedict",
          }),
        ],
      });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Recipes />
      </QueryClientProvider>
    );

    await screen.findByText("Eggs Benedict");
  });
});
