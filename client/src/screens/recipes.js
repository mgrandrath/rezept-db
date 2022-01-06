import { useRecipes } from "../api.js";

const RecipesList = () => {
  const recipes = useRecipes();

  if (recipes.isLoading) {
    return <div>Loading…</div>;
  }

  if (recipes.isError) {
    return <div>Error: {recipes.error.message}</div>;
  }

  return (
    <ul>
      {recipes.data.map((recipe) => (
        <li key={recipe.recipeId}>{recipe.title}</li>
      ))}
    </ul>
  );
};

const Recipes = () => {
  return (
    <div>
      <h1>Find recipe</h1>
      <RecipesList />
    </div>
  );
};

export default Recipes;
