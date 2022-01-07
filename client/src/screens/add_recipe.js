import { useEffect } from "react";
import { Formik } from "formik";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import Alert from "react-bootstrap/Alert";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useAddRecipe } from "../api.js";
import { useToast } from "../toast.js";

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
  const { addToast } = useToast();

  useEffect(() => {
    if (addRecipe.isSuccess) {
      addToast({
        heading: "Success",
        message: "Recipe has been added",
      });
    }
  }, [addToast, addRecipe.isSuccess]);

  return (
    <Formik
      initialValues={{ title: "", notes: "" }}
      validate={validateRecipeInput}
      onSubmit={async (recipeInput, { setSubmitting, resetForm }) => {
        try {
          await addRecipe.mutateAsync(recipeInput);
          resetForm();
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {(formik) => (
        <Form
          noValidate
          onSubmit={formik.handleSubmit}
          disabled={formik.isSubmitting}
        >
          {addRecipe.isError && (
            <Row lg={2} xxl={3} className="mb-3">
              <Col>
                <Alert variant="danger" dismissible onClose={addRecipe.reset}>
                  Error: {addRecipe.error.message}
                </Alert>
              </Col>
            </Row>
          )}

          <Row lg={2} xxl={3} className="mb-3">
            <Form.Group as={Col} controlId="title">
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

const AddRecipe = () => {
  return (
    <div>
      <h1 className="mb-5">Add recipe</h1>
      <AddRecipeForm />
    </div>
  );
};

export default AddRecipe;
