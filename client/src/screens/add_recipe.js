import { useState } from "react";
import { Alert, Col, Row } from "react-bootstrap";
import { useAddRecipe } from "../api.js";
import { RecipeInputForm } from "../components/recipe.js";
import { useToast } from "../toast.js";

const AddRecipeForm = () => {
  const addRecipe = useAddRecipe();
  const { addToast } = useToast();
  const [counter, setCounter] = useState(1);
  const recipeInput = { name: "", notes: "" };

  const onSubmit = async (recipeInput) => {
    await addRecipe.mutateAsync(recipeInput, {
      onSuccess: () => {
        addToast({
          heading: "Success",
          message: "Recipe has been added",
        });
      },
    });
    setCounter((c) => c + 1);
  };

  return (
    <>
      {addRecipe.isError && (
        <Row lg={2} xxl={3} className="mb-3">
          <Col>
            <Alert variant="danger" dismissible onClose={addRecipe.reset}>
              Error: {addRecipe.error.message}
            </Alert>
          </Col>
        </Row>
      )}

      {/*
        We update the form's key after each successful submit to force
        a re-render and thus resetting the form values
      */}
      <RecipeInputForm
        key={`submit-${counter}`}
        recipeInput={recipeInput}
        onSubmit={onSubmit}
      />
    </>
  );
};

const AddRecipe = () => {
  return (
    <div>
      <h1 className="mb-5">Add recipe</h1>
      <Row>
        <Col md={10} lg={6} xxl={5}>
          <AddRecipeForm />
        </Col>
      </Row>
    </div>
  );
};

export default AddRecipe;
