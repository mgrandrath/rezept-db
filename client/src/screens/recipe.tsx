import { type ReactNode } from "react";
import { Alert, Card, Stack } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { useRecipe } from "../api";
import { Markdown } from "../components/markdown";
import {
  dietLabels,
  prepTimeLabels,
  seasonLabels,
  sourceTypes,
} from "../constants";
import { paths } from "../paths";
import { Season } from "../types";
import { safeGeneratePath } from "../util/url";

interface LabelProps {
  children?: ReactNode;
}

const Label = (props: LabelProps) => {
  return <div className="form-label fw-bold">{props.children}</div>;
};

const Recipe = () => {
  const { recipeId } = useParams();
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
          <Label>Seasons</Label>
          <ul>
            {Object.entries(recipe.seasons)
              .filter(([, isChecked]) => isChecked)
              .map(([season]) => (
                <li key={season}>{seasonLabels[season as Season]}</li>
              ))}
          </ul>
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

        <Link
          to={safeGeneratePath(paths.editRecipe, {
            recipeId: recipeId as string, // when this screen is rendered there should be a recipeId URL param
          })}
        >
          Edit
        </Link>
      </Stack>
    </div>
  );
};

export default Recipe;
