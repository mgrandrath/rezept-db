import { Alert, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useRecipe, useUpdateRecipe } from "../api";
import { RecipeInputForm } from "../components/recipe";
import { editRecipeRoute, recipeRoute } from "../routes";
import { useToast } from "../toast";
import { RecipeInput } from "../types";

const EditRecipe = () => {
  const navigate = useNavigate();
  const { recipeId } = editRecipeRoute.useParams();
  const { addToast } = useToast();
  const recipeQuery = useRecipe(recipeId);
  const updateRecipe = useUpdateRecipe(recipeId);

  const onSubmit = async (recipeInput: RecipeInput) => {
    await updateRecipe.mutateAsync(recipeInput, {
      onSuccess: () => {
        addToast({
          heading: "Success",
          message: "Recipe has been updated",
        });
        navigate(recipeRoute.url({ recipeId }), {
          replace: true,
        });
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      },
    });
  };

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
  const recipeInput = {
    name: recipe.name,
    diet: recipe.diet,
    prepTime: recipe.prepTime,
    notes: recipe.notes,
    source: recipe.source,
    seasons: recipe.seasons,
    tags: recipe.tags,
  };

  return (
    <div className="mb-5">
      <h1 className="mb-5">Edit recipe</h1>

      {updateRecipe.isError && (
        <Row className="mb-3">
          <Col md={10} lg={6} xxl={5}>
            <Alert variant="danger" dismissible onClose={updateRecipe.reset}>
              Error: {updateRecipe.error.message}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col md={10} lg={6} xxl={5}>
          <RecipeInputForm
            recipeInput={recipeInput}
            backLink={recipeRoute.url({ recipeId })}
            onSubmit={onSubmit}
          />
        </Col>
      </Row>
    </div>
  );
};

export default EditRecipe;
