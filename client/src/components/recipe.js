import { Field, Formik, getIn, useFormikContext } from "formik";
import { useEffect, useRef } from "react";
import { Button, Form, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import { diets, sourceTypes } from "../constants.js";
import { useOnlyWhenMounted } from "../util/react.js";

const commonFieldProps = (formik, name) => ({
  name,
  isInvalid: Boolean(getIn(formik.touched, name) && getIn(formik.errors, name)),
});

const textInputProps = (formik, name, { type = "text" } = {}) => ({
  ...commonFieldProps(formik, name),
  as: Form.Control,
  type,
});

const textAreaProps = (formik, name) => ({
  ...commonFieldProps(formik, name),
  as: TextArea,
});

const radioProps = (formik, name) => ({
  ...commonFieldProps(formik, name),
  as: Form.Check,
  type: "radio",
});

const selectInputProps = (formik, name) => ({
  ...commonFieldProps(formik, name),
  as: Form.Select,
});

const isValidUrl = (candidate) => {
  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
};

const validateRecipeInput = (recipeInput) => {
  const errors = {};

  if (!recipeInput.name) {
    errors.name = "Please enter a name";
  }

  if (recipeInput.source.type === sourceTypes.ONLINE) {
    if (!isValidUrl(recipeInput.source.url)) {
      errors.source = errors.source ?? {};
      errors.source.url = "Please enter a valid URL";
    }
  }

  if (recipeInput.source.type === sourceTypes.OFFLINE) {
    if (!recipeInput.source.title) {
      errors.source = errors.source ?? {};
      errors.source.title = "Please enter a title";
    }
    if (!recipeInput.source.page) {
      errors.source = errors.source ?? {};
      errors.source.page = "Please enter a page";
    }
  }

  if (!recipeInput.diet) {
    errors.diet = "Please select a diet";
  }

  return errors;
};

const TextArea = (props) => {
  return <Form.Control {...props} as="textarea" />;
};

const UpdateSource = (props) => {
  const {
    values: { source: { type } = {} },
    setFieldValue,
    setFieldTouched,
  } = useFormikContext();

  const setFieldValueRef = useRef();
  setFieldValueRef.current = setFieldValue;

  const setFieldTouchedRef = useRef();
  setFieldTouchedRef.current = setFieldTouched;

  useEffect(() => {
    switch (type) {
      case sourceTypes.ONLINE:
        setFieldValueRef.current("source.title", "");
        setFieldValueRef.current("source.page", "");
        setFieldTouchedRef.current("source.url", false);
        break;

      case sourceTypes.OFFLINE:
        setFieldValueRef.current("source.url", "");
        setFieldTouchedRef.current("source.title", false);
        setFieldTouchedRef.current("source.page", false);
        break;

      default:
        break;
    }
  }, [type]);

  return null;
};

const cleanupRecipeInput = (formValues) => {
  let source;
  switch (formValues.source.type) {
    case sourceTypes.ONLINE:
      source = {
        type: sourceTypes.ONLINE,
        url: formValues.source.url,
      };
      break;

    case sourceTypes.OFFLINE:
      source = {
        type: sourceTypes.OFFLINE,
        title: formValues.source.title,
        page: formValues.source.page,
      };
      break;

    default:
      source = null;
  }

  return {
    ...formValues,
    source,
  };
};

export const RecipeInputForm = (props) => {
  const { recipeInput, onSubmit, backLink } = props;
  const onlyWhenMounted = useOnlyWhenMounted();

  const handleSubmit = async (recipeInput, { setSubmitting }) => {
    try {
      await onSubmit(cleanupRecipeInput(recipeInput));
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
          <UpdateSource />
          <Form.Group controlId="name" className="mb-3">
            <Form.Label>Name</Form.Label>
            <Field {...textInputProps(formik, "name")} size="lg" />
            <Form.Control.Feedback type="invalid">
              {formik.errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <fieldset className="border border-2 rounded px-3 pb-2 mb-3">
            <legend className="w-auto px-2 float-none">Source</legend>
            <div className="mb-3">
              <Form.Group controlId="sourceTypeOnline">
                <Field
                  {...radioProps(formik, "source.type")}
                  label="Online"
                  value={sourceTypes.ONLINE}
                />
              </Form.Group>
              <Form.Group controlId="sourceTypeOffline">
                <Field
                  {...radioProps(formik, "source.type")}
                  label="Offline"
                  value={sourceTypes.OFFLINE}
                />
              </Form.Group>
            </div>

            {formik.values.source?.type === sourceTypes.ONLINE && (
              <Form.Group controlId="source.url" className="mb-3">
                <Form.Label>URL</Form.Label>
                <Field
                  {...textInputProps(formik, "source.url", { type: "url" })}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.source?.url}
                </Form.Control.Feedback>
              </Form.Group>
            )}

            {formik.values.source?.type === sourceTypes.OFFLINE && (
              <Stack
                direction="horizontal"
                gap={3}
                className="justify-content-between align-items-start mb-3"
              >
                <Form.Group controlId="source.title" className="flex-grow-1">
                  <Form.Label>Title</Form.Label>
                  <Field {...textInputProps(formik, "source.title")} />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.source?.title}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="source.page" className="w-25">
                  <Form.Label>Page</Form.Label>
                  <Field
                    {...textInputProps(formik, "source.page", {
                      type: "number",
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.source?.page}
                  </Form.Control.Feedback>
                </Form.Group>
              </Stack>
            )}
          </fieldset>

          <Form.Group controlId="diet" className="mb-3">
            <Form.Label>Diet</Form.Label>
            <Field {...selectInputProps(formik, "diet")}>
              <option>Please select</option>
              <option value={diets.VEGAN}>Vegan</option>
              <option value={diets.VEGETARIAN}>Vegetarian</option>
              <option value={diets.OMNIVORE}>Omnivore</option>
            </Field>
            <Form.Control.Feedback type="invalid">
              {formik.errors.diet}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="notes" className="mb-4">
            <Form.Label>Notes</Form.Label>
            <Field {...textAreaProps(formik, "notes")} />
            <Form.Control.Feedback type="invalid">
              {formik.errors.notes}
            </Form.Control.Feedback>
          </Form.Group>

          <Stack direction="horizontal" className="gap-3 justify-content-end">
            {backLink && (
              <Button variant="outline-secondary" as={Link} to={backLink}>
                Cancel
              </Button>
            )}
            <Button type="submit" className="x-ms-auto">
              Save
            </Button>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};
