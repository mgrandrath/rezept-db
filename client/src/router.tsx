import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { App } from "./app";
import { paths } from "./paths";
import AddRecipe from "./screens/add_recipe";
import EditRecipe from "./screens/edit_recipe.js";
import Recipe from "./screens/recipe";
import Recipes from "./screens/recipes.js";

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate replace to={paths.recipes} />} />
          <Route path={paths.addRecipe} element={<AddRecipe />} />
          <Route path={paths.recipes} element={<Recipes />} />
          <Route path={paths.recipe} element={<Recipe />} />
          <Route path={paths.editRecipe} element={<EditRecipe />} />
          <Route path="*" element={<p>404 — Screen not found</p>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
