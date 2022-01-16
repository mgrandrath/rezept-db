import { Formik } from "formik";
import { useEffect, useRef } from "react";
import { Button, Form, Stack } from "react-bootstrap";

const useOnlyWhenMounted = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return (f) => {
    if (isMountedRef.current) {
      f();
    }
  };
};

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

export const RecipeInputForm = (props) => {
  const { recipeInput, onSubmit } = props;
  const onlyWhenMounted = useOnlyWhenMounted();

  const handleSubmit = async (recipeInput, { setSubmitting }) => {
    try {
      await onSubmit(recipeInput);
    } finally {
      // Only update Formik's `submitting` state if this component is still
      // mounted. Otherwise this will result in the error message "Can't perform
      // a React state update on an unmounted component".
      onlyWhenMounted(() => {
        setSubmitting(false);
      });
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
          <Form.Group controlId="name" className="mb-3">
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

          <Form.Group controlId="notes" className="mb-4">
            <Form.Label>Notes</Form.Label>
            <Form.Control as="textarea" {...getFieldProps(formik, "notes")} />
            <Form.Control.Feedback type="invalid">
              {formik.errors.notes}
            </Form.Control.Feedback>
          </Form.Group>

          <Stack direction="horizontal">
            <Button type="submit" className="ms-auto">
              Save
            </Button>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};
