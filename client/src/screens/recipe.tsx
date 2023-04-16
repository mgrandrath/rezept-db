import { type ReactNode } from "react";
import { Alert, Card, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useRecipe } from "../api";
import { Markdown } from "../components/markdown";
import { dietLabels, prepTimeLabels, sourceTypes } from "../constants";
import { editRecipeRoute, recipeRoute } from "../routes";

interface LabelProps {
  children?: ReactNode;
}

const Label = (props: LabelProps) => {
  return <div className="form-label fw-bold">{props.children}</div>;
};

const Recipe = () => {
  const { recipeId } = recipeRoute.useParams();
  const recipeQuery = useRecipe(recipeId);

  if (recipeQuery.isLoading) {
    return <div>Loading…</div>;
  }

  if (recipeQuery.isError) {
    return <Alert variant="danger">Error: {recipeQuery.error.message}</Alert>;
  }

  if (!recipeQuery.isSuccess) {
    return <Alert variant="danger">Failed to load recipe :-(</Alert>;
  }

  const recipe = recipeQuery.data;

  return (
    <div>
      <h1 className="mb-5">{recipe.name}</h1>

      <Stack gap={3}>
        <div>
          <Label>Source</Label>
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

        <div>
          <Label>Diet</Label>
          {dietLabels[recipe.diet]}
        </div>

        <div>
          <Label>Preperation time</Label>
          {prepTimeLabels[recipe.prepTime]}
        </div>

        <div>
          <Label>Tags</Label>
          <ul>
            {recipe.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>

        <div>
          <Label>Notes</Label>
          <Card>
            <Card.Body>
              <Markdown>{recipe.notes}</Markdown>
            </Card.Body>
          </Card>
        </div>

        <Link to={editRecipeRoute.url({ recipeId })}>Edit</Link>
      </Stack>
    </div>
  );
};

export default Recipe;
