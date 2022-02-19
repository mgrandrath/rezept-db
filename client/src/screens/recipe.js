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
            <div>
              URL:{" "}
              <a
                rel="external noopener noreferrer"
                target="_blank"
                href={recipe.source.url}
              >
                {recipe.source.url}
              </a>
            </div>
          </>
        )}
        {recipe.source?.type === sourceTypes.OFFLINE && (
          <>
            <div>Title: {recipe.source.title}</div>
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
