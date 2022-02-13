import { Field, Formik, getIn, useFormikContext } from "formik";
import { useEffect, useRef } from "react";
import { Button, Form, Stack } from "react-bootstrap";
import { sourceTypes } from "../constants.js";
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
    if (!recipeInput.source.name) {
      errors.source = errors.source ?? {};
      errors.source.name = "Please enter a name";
    }
    if (!recipeInput.source.page) {
      errors.source = errors.source ?? {};
      errors.source.page = "Please enter a page";
    }
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
        setFieldValueRef.current("source.name", "");
        setFieldValueRef.current("source.page", "");
        setFieldTouchedRef.current("source.url", false);
        break;

      case sourceTypes.OFFLINE:
        setFieldValueRef.current("source.url", "");
        setFieldTouchedRef.current("source.name", false);
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
        name: formValues.source.name,
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
  const { recipeInput, onSubmit } = props;
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
              <>
                <Form.Group controlId="source.name" className="mb-3">
                  <Form.Label>Source Name</Form.Label>
                  <Field {...textInputProps(formik, "source.name")} />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.source?.name}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="source.page" className="mb-3">
                  <Form.Label>Page</Form.Label>
                  <Field {...textInputProps(formik, "source.page")} />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.source?.page}
                  </Form.Control.Feedback>
                </Form.Group>
              </>
            )}
          </fieldset>

          <Form.Group controlId="notes" className="mb-4">
            <Form.Label>Notes</Form.Label>
            <Field {...textAreaProps(formik, "notes")} />
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
