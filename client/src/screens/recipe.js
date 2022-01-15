import { useParams } from "react-router-dom";

const Recipe = () => {
  const { recipeId } = useParams();

  return <div>Recipe {recipeId}</div>;
};

export default Recipe;
