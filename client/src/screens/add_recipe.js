import { Formik } from "formik";
import { useState } from "react";
import { Alert, Button, Col, Form, Row, Stack } from "react-bootstrap";
import { useAddRecipe } from "../api.js";
import { useToast } from "../toast.js";

const getFieldProps = (formik, name) => ({
  ...formik.getFieldProps(name),
  isInvalid: Boolean(formik.touched[name] && formik.errors[name]),
});

const validateRecipeInput = (recipeInput) => {
  const errors = {};

  if (!recipeInput.name) {
    errors.name = "Please enter a name";
  }

  return errors;
};

const RecipeInputForm = (props) => {
  const { recipeInput, onSubmit } = props;

  const handleSubmit = async (recipeInput, { setSubmitting }) => {
    try {
      await onSubmit(recipeInput);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={recipeInput}
      validate={validateRecipeInput}
      onSubmit={handleSubmit}
    >
      {(formik) => (
        <Form
          noValidate
          onSubmit={formik.handleSubmit}
          disabled={formik.isSubmitting}
        >
          <Row lg={2} xxl={3} className="mb-3">
            <Form.Group as={Col} controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                size="lg"
                {...getFieldProps(formik, "name")}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.name}
              </Form.Control.Feedback>
            </Form.Group>
          </Row>

          <Row lg={2} xxl={3} className="mb-4">
            <Form.Group as={Col} controlId="notes">
              <Form.Label>Notes</Form.Label>
              <Form.Control as="textarea" {...getFieldProps(formik, "notes")} />
              <Form.Control.Feedback type="invalid">
                {formik.errors.notes}
              </Form.Control.Feedback>
            </Form.Group>
          </Row>

          <Row lg={2} xxl={3}>
            <Col>
              <Stack direction="horizontal">
                <Button type="submit" className="ms-auto">
                  Save
                </Button>
              </Stack>
            </Col>
          </Row>
        </Form>
      )}
    </Formik>
  );
};

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
      <AddRecipeForm />
    </div>
  );
};

export default AddRecipe;
