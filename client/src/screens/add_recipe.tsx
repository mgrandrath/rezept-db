import { Alert, Col, Row } from "react-bootstrap";
import { useAddRecipe } from "../api";
import { RecipeInputForm } from "../components/recipe";
import { sourceTypes } from "../constants";
import { recipesRoute } from "../routes";
import { useToast } from "../toast";
import { RecipeInput } from "../types";
import { useRerenderChild } from "../util/react";

const AddRecipe = () => {
  const addRecipe = useAddRecipe();
  const { addToast } = useToast();
  const [formKey, rerenderForm] = useRerenderChild();
  const recipeInput = {
    name: "",
    diet: "" as const,
    prepTime: "" as const,
    notes: "",
    source: { type: sourceTypes.ONLINE, url: "", title: "", page: null },
    tags: [],
  };

  const onSubmit = async (recipeInput: RecipeInput) => {
    await addRecipe.mutateAsync(recipeInput, {
      onSuccess: () => {
        addToast({
          heading: "Success",
          message: `Recipe "${recipeInput.name}" has been added`,
        });
        rerenderForm();
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      },
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
            key={formKey}
            recipeInput={recipeInput}
            onSubmit={onSubmit}
            backLink={recipesRoute.url({})}
          />
        </Col>
      </Row>
    </div>
  );
};

export default AddRecipe;
