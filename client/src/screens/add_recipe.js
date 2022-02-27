import { useState } from "react";
import { Alert, Col, Row } from "react-bootstrap";
import { useAddRecipe } from "../api.js";
import { RecipeInputForm } from "../components/recipe.js";
import { seasons, sourceTypes } from "../constants.js";
import { paths } from "../paths.js";
import { useToast } from "../toast.js";
import { useOnlyWhenMounted } from "../util/react.js";

const AddRecipe = () => {
  const addRecipe = useAddRecipe();
  const { addToast } = useToast();
  const [counter, setCounter] = useState(1);
  const onlyWhenMounted = useOnlyWhenMounted();
  const recipeInput = {
    name: "",
    diet: "",
    prepTime: "",
    notes: "",
    source: { type: sourceTypes.ONLINE, url: "" },
    seasons: {
      [seasons.SPRING]: true,
      [seasons.SUMMER]: true,
      [seasons.FALL]: true,
      [seasons.WINTER]: true,
    },
    tags: [],
  };

  const onSubmit = async (recipeInput) => {
    await addRecipe.mutateAsync(recipeInput, {
      onSuccess: () => {
        addToast({
          heading: "Success",
          message: "Recipe has been added",
        });
      },
    });

    onlyWhenMounted(() => {
      // Increasing the counter creates a new `key` for the <RecipeInputForm>
      // which forces a re-render and thus resets the form values.
      setCounter((c) => c + 1);
    });
  };

  return (
    <div className="mb-5">
      <h1 className="mb-5">Add recipe</h1>

      {addRecipe.isError && (
        <Row className="mb-3">
          <Col md={10} lg={6} xxl={5}>
            <Alert variant="danger" dismissible onClose={addRecipe.reset}>
              Error: {addRecipe.error.message}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col md={10} lg={6} xxl={5}>
          <RecipeInputForm
            key={`submit-${counter}`}
            recipeInput={recipeInput}
            onSubmit={onSubmit}
            backLink={paths.recipes}
          />
        </Col>
      </Row>
    </div>
  );
};

export default AddRecipe;
