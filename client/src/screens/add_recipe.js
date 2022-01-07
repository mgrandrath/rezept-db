import { Alert, Button, Form } from "react-bootstrap";
import { Formik } from "formik";
import { useAddRecipe } from "../api.js";

const getFieldProps = (formik, name) => ({
  ...formik.getFieldProps(name),
  isInvalid: Boolean(formik.touched[name] && formik.errors[name]),
});

const validateRecipeInput = (recipeInput) => {
  const errors = {};

  if (!recipeInput.title) {
    errors.title = "Please enter a title";
  }

  return errors;
};

const AddRecipeForm = () => {
  const addRecipe = useAddRecipe();

  return (
    <>
      {addRecipe.isError && (
        <Alert variant="danger">Error: {addRecipe.error.message}</Alert>
      )}
      {addRecipe.isSuccess && (
        <Alert variant="success">Recipe has been added</Alert>
      )}

      <Formik
        initialValues={{ title: "", notes: "" }}
        validate={validateRecipeInput}
        onSubmit={async (recipeInput, { setSubmitting, resetForm }) => {
          await addRecipe.mutateAsync(recipeInput);
          setSubmitting(false);
          resetForm();
        }}
      >
        {(formik) => (
          <Form
            noValidate
            onSubmit={formik.handleSubmit}
            disabled={formik.isSubmitting}
          >
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                size="lg"
                {...getFieldProps(formik, "title")}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.title}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="notes">
              <Form.Label>Notes</Form.Label>
              <Form.Control as="textarea" {...getFieldProps(formik, "notes")} />
              <Form.Control.Feedback type="invalid">
                {formik.errors.notes}
              </Form.Control.Feedback>
            </Form.Group>

            <Button type="submit">Save</Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

const AddRecipe = () => {
  return (
    <div>
      <h1>Add recipe</h1>
      <AddRecipeForm />
    </div>
  );
};

export default AddRecipe;
