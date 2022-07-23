import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { App } from "./app";
import {
  addRecipeRoute,
  editRecipeRoute,
  recipeRoute,
  recipesRoute,
} from "./routes";
import AddRecipe from "./screens/add_recipe";
import EditRecipe from "./screens/edit_recipe";
import Recipe from "./screens/recipe";
import Recipes from "./screens/recipes";

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate replace to={recipesRoute.route} />} />
          <Route path={addRecipeRoute.route} element={<AddRecipe />} />
          <Route path={recipesRoute.route} element={<Recipes />} />
          <Route path={recipeRoute.route} element={<Recipe />} />
          <Route path={editRecipeRoute.route} element={<EditRecipe />} />
          <Route path="*" element={<p>404 — Screen not found</p>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
