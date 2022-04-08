import { Alert, Card, Stack } from "react-bootstrap";
import Markdown from "react-markdown";
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

      <Stack gap={3}>
        <div>
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

        <div>Diet: {recipe.diet}</div>

        <div>Preperation time: {recipe.prepTime}</div>

        <div>
          Seasons:
          <ul>
            {Object.entries(recipe.seasons)
              .filter(([, value]) => value)
              .map(([key]) => (
                <li key={key}>{key}</li>
              ))}
          </ul>
        </div>

        <div>
          Tags:
          <ul>
            {recipe.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>

        <div>
          <div>Notes</div>
          <Card>
            <Card.Body>
              <Markdown>{recipe.notes}</Markdown>
            </Card.Body>
          </Card>
        </div>

        <Link to={safeGeneratePath(paths.editRecipe, { recipeId })}>Edit</Link>
      </Stack>
    </div>
  );
};

export default Recipe;
