import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { App } from "./app.js";
import AddRecipe from "./screens/add_recipe.js";
import EditRecipe from "./screens/edit_recipe.js";
import Recipe from "./screens/recipe.js";
import Recipes from "./screens/recipes.js";

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate replace to="/recipes" />} />
          <Route path="add-recipe" element={<AddRecipe />} />
          <Route path="recipes">
            <Route index element={<Recipes />} />
            <Route path=":recipeId">
              <Route index element={<Recipe />} />
              <Route path="edit" element={<EditRecipe />} />
            </Route>
          </Route>
          <Route path="*" element={<p>404 — Screen not found</p>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
