import { Alert, Card } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { useRecipe } from "../api.js";
import { sourceTypes } from "../constants.js";
import { paths } from "../paths.js";
import { safeGeneratePath } from "../util/url.js";

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
      <div className="mb-3">
        <div>Source</div>
        <div>Type: {recipe.source?.type}</div>
        {recipe.source?.type === sourceTypes.ONLINE && (
          <>
            <div>URL: {recipe.source.url}</div>
          </>
        )}
        {recipe.source?.type === sourceTypes.OFFLINE && (
          <>
            <div>Source Name: {recipe.source.name}</div>
            <div>Page: {recipe.source.page}</div>
          </>
        )}
      </div>
      <div className="mb-3">
        <div>Notes</div>
        <Card>
          <Card.Body>{recipe.notes}</Card.Body>
        </Card>
      </div>
      <Link to={safeGeneratePath(paths.editRecipe, { recipeId })}>Edit</Link>
    </div>
  );
};

export default Recipe;
