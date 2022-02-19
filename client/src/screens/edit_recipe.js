import { Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useRecipe, useUpdateRecipe } from "../api.js";
import { RecipeInputForm } from "../components/recipe.js";
import { paths } from "../paths.js";
import { useToast } from "../toast.js";
import { safeGeneratePath } from "../util/url.js";

const EditRecipe = () => {
  const navigate = useNavigate();
  const { recipeId } = useParams();
  const { addToast } = useToast();
  const recipeQuery = useRecipe(recipeId);
  const updateRecipe = useUpdateRecipe(recipeId);

  const onSubmit = async (recipeInput) => {
    await updateRecipe.mutateAsync(recipeInput, {
      onSuccess: () => {
        addToast({
          heading: "Success",
          message: "Recipe has been updated",
        });
        navigate(safeGeneratePath(paths.recipe, { recipeId }), {
          replace: true,
        });
      },
    });
  };

  if (recipeQuery.isLoading) {
    return <div>Loading…</div>;
  }

  if (recipeQuery.isError) {
    return <Alert variant="danger">Error: {recipeQuery.error.message}</Alert>;
  }

  const recipe = recipeQuery.data;
  const recipeInput = {
    name: recipe.name,
    notes: recipe.notes,
    source: recipe.source,
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
