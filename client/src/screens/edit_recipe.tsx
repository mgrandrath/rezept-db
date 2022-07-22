import { Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useRecipe, useUpdateRecipe } from "../api";
import { RecipeInputForm } from "../components/recipe";
import { paths } from "../paths";
import { useToast } from "../toast";
import { RecipeInput } from "../types";
import { safeGeneratePath } from "../util/url";

const EditRecipe = () => {
  const navigate = useNavigate();
  const {
    // We know that `recipeId` is set b/c it's a required path param. The
    // default's purpose is only to convince tsc that `recipeId` is not
    // `undefined`.
    recipeId = "",
  } = useParams();
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
        navigate(safeGeneratePath(paths.recipe, { recipeId }), {
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
            backLink={safeGeneratePath(paths.recipe, { recipeId })}
            onSubmit={onSubmit}
          />
        </Col>
      </Row>
    </div>
  );
};

export default EditRecipe;
