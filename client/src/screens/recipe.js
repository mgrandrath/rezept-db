import { Alert, Card } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useRecipe } from "../api.js";

const Recipe = () => {
  const { recipeId } = useParams();
  const recipeQuery = useRecipe(recipeId);
  const recipe = recipeQuery.data;

  if (recipeQuery.isLoading) {
    return <div>Loading…</div>;
  }

  if (recipeQuery.isError) {
    return <Alert variant="danger">Error: {recipeQuery.error.message}</Alert>;
  }

  return (
    <div>
      <h1 className="mb-5">{recipe.name}</h1>
      <div>
        <div>Notes</div>
        <Card>
          <Card.Body>{recipe.notes}</Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Recipe;
