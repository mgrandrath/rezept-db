import { Field, Formik, getIn, useField, useFormikContext } from "formik";
import { useEffect, useRef } from "react";
import classNames from "classnames";
import { Button, Form, OverlayTrigger, Popover, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import { diets, prepTimes, seasons, sourceTypes } from "../constants.js";
import { useOnlyWhenMounted } from "../util/react.js";
import { TagsInput } from "./form.js";
import { useAutocomplete } from "../api.js";

const randomId = () => Math.random().toString(36).substring(2);

const TextInput = (props) => {
  const { className, label, labelClass = "fw-bold", ...inputProps } = props;

  const idRef = useRef(`text-input-${randomId()}`);
  const [formikProps, meta] = useField(inputProps);
  const defaultInputProps = {
    autoComplete: "off",
    isInvalid: meta.touched && meta.error,
  };

  return (
    <Form.Group
      controlId={idRef.current}
      className={classNames(className, "position-relative")}
    >
      <Form.Label className={labelClass}>{label}</Form.Label>
      <Form.Control {...defaultInputProps} {...inputProps} {...formikProps} />
      <Form.Control.Feedback tooltip type="invalid">
        {meta.error}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

const TextInputAutocomplete = (props) => {
  const { acAttribute, ...inputProps } = props;

  const autocompleteQuery = useAutocomplete(acAttribute);
  const datalistIdRef = useRef(`autocomplete-${randomId()}`);

  return (
    <>
      <TextInput {...inputProps} list={datalistIdRef.current} />
      <datalist id={datalistIdRef.current}>
        {autocompleteQuery.data?.map?.((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </>
  );
};

const SelectInput = (props) => {
  const { label, children, className, ...inputProps } = props;

  const idRef = useRef(`select-input-${randomId()}`);
  const [formikProps, meta] = useField(inputProps);
  const defaultInputProps = {
    isInvalid: meta.touched && meta.error,
  };

  return (
    <Form.Group
      controlId={idRef.current}
      className={classNames(className, "position-relative")}
    >
      <Form.Label className="fw-bold">{label}</Form.Label>
      <Form.Select {...defaultInputProps} {...inputProps} {...formikProps}>
        {children}
      </Form.Select>
      <Form.Control.Feedback tooltip type="invalid">
        {meta.error}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

const RadioButton = (props) => {
  const idRef = useRef(`radio-button-${randomId()}`);
  const [formikProps, meta] = useField({ ...props, type: "radio" });
  const defaultInputProps = {
    type: "radio",
    isInvalid: meta.touched && meta.error,
  };

  return (
    <Form.Group controlId={idRef.current}>
      <Form.Check {...defaultInputProps} {...props} {...formikProps} />
    </Form.Group>
  );
};

const commonFieldProps = (formik, name) => ({
  name,
  isInvalid: Boolean(getIn(formik.touched, name) && getIn(formik.errors, name)),
});

const textAreaProps = (formik, name) => ({
  ...commonFieldProps(formik, name),
  as: TextArea,
});

const checkboxProps = (formik, name) => ({
  ...commonFieldProps(formik, name),
  as: Form.Check.Input,
  type: "checkbox",
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

  if (!recipeInput.prepTime) {
    errors.prepTime = "Please select a preperation time";
  }

  if (Object.values(recipeInput.seasons).every((value) => !value)) {
    errors.seasons = "Please select at least one season";
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
          <Stack gap={4}>
            <TextInput name="name" label="Name" size="lg" />

            <fieldset className="border border-2 rounded px-3 pt-0 pb-3">
              <legend className="fs-6 fw-bold w-auto px-2 float-none">
                Source
              </legend>
              <Stack gap={2}>
                <div>
                  <RadioButton
                    name="source.type"
                    label="Online"
                    value={sourceTypes.ONLINE}
                  />
                  <RadioButton
                    name="source.type"
                    label="Offline"
                    value={sourceTypes.OFFLINE}
                  />
                </div>

                {formik.values.source?.type === sourceTypes.ONLINE && (
                  <TextInput
                    name="source.url"
                    label="URL"
                    type="url"
                    labelClass="fw-normal"
                  />
                )}

                {formik.values.source?.type === sourceTypes.OFFLINE && (
                  <Stack
                    direction="horizontal"
                    gap={3}
                    className="justify-content-between align-items-start"
                  >
                    <TextInputAutocomplete
                      name="source.title"
                      label="Title"
                      acAttribute="offlineSourceTitle"
                      className="flex-grow-1"
                      labelClass="fw-normal"
                    />
                    <TextInput
                      name="source.page"
                      label="Page"
                      type="number"
                      labelClass="fw-normal"
                      className="w-25"
                    />
                  </Stack>
                )}
              </Stack>
            </fieldset>

            <SelectInput name="diet" label="Diet">
              <option value="">Please select</option>
              <option value={diets.VEGAN}>Vegan</option>
              <option value={diets.VEGETARIAN}>Vegetarian</option>
              <option value={diets.OMNIVORE}>Omnivore</option>
            </SelectInput>

            <SelectInput name="prepTime" label="Preperation time">
              <option value="">Please select</option>
              <option value={prepTimes.UNDER_30_MINUTES}>
                under 30 minutes
              </option>
              <option value={prepTimes["30_TO_60_MINUTES"]}>
                30—60 minutes
              </option>
              <option value={prepTimes["60_TO_120_MINUTES"]}>
                60—120 minutes
              </option>
              <option value={prepTimes.OVER_120_MINUTES}>
                over 120 minutes
              </option>
            </SelectInput>

            <div>
              <div className="fw-bold form-label">Seasons</div>
              <Stack
                direction="horizontal"
                className="justify-content-between align-items-start"
              >
                <Form.Group controlId={`seasons.${seasons.SPRING}`}>
                  <Form.Check>
                    <Field
                      {...checkboxProps(formik, `seasons.${seasons.SPRING}`)}
                    />
                    <Form.Check.Label>Spring</Form.Check.Label>
                    <Form.Text className="d-block">Mar, Apr, May</Form.Text>
                  </Form.Check>
                </Form.Group>
                <Form.Group controlId={`seasons.${seasons.SUMMER}`}>
                  <Form.Check>
                    <Field
                      {...checkboxProps(formik, `seasons.${seasons.SUMMER}`)}
                    />
                    <Form.Check.Label>Summer</Form.Check.Label>
                    <Form.Text className="d-block">Jun, Jul, Aug</Form.Text>
                  </Form.Check>
                </Form.Group>
                <Form.Group controlId={`seasons.${seasons.FALL}`}>
                  <Form.Check>
                    <Field
                      {...checkboxProps(formik, `seasons.${seasons.FALL}`)}
                    />
                    <Form.Check.Label>Fall</Form.Check.Label>
                    <Form.Text className="d-block">Sep, Oct, Nov</Form.Text>
                  </Form.Check>
                </Form.Group>
                <Form.Group controlId={`seasons.${seasons.WINTER}`}>
                  <Form.Check>
                    <Field
                      {...checkboxProps(formik, `seasons.${seasons.WINTER}`)}
                    />
                    <Form.Check.Label>Winter</Form.Check.Label>
                    <Form.Text className="d-block">Dec, Jan, Feb</Form.Text>
                  </Form.Check>
                </Form.Group>
              </Stack>
              {(formik.touched.seasons?.[seasons.SPRING] ||
                formik.touched.seasons?.[seasons.SUMMER] ||
                formik.touched.seasons?.[seasons.FALL] ||
                formik.touched.seasons?.[seasons.WINTER]) &&
                formik.errors.seasons && (
                  <div className="text-danger small mt-1">
                    {formik.errors.seasons}
                  </div>
                )}
            </div>

            <Form.Group controlId="tags">
              <Form.Label className="fw-bold">Tags</Form.Label>{" "}
              <OverlayTrigger
                overlay={
                  <Popover>
                    <Popover.Header>Suggestions</Popover.Header>
                    <Popover.Body>
                      <ul className="m-0 ps-3">
                        <li>Main ingredients</li>
                        <li>Chef</li>
                        <li>Cuisine</li>
                        <li>Type ("Pasts", "Side", …)</li>
                      </ul>
                    </Popover.Body>
                  </Popover>
                }
              >
                <span className="cursor-help">ⓘ</span>
              </OverlayTrigger>
              <TagsInput
                name="tags"
                value={formik.values.tags}
                onChange={formik.handleChange}
              />
            </Form.Group>

            <Form.Group controlId="notes">
              <Form.Label className="fw-bold">Notes</Form.Label>
              <Field {...textAreaProps(formik, "notes")} />
              <Form.Control.Feedback type="invalid">
                {formik.errors.notes}
              </Form.Control.Feedback>
            </Form.Group>

            <Stack direction="horizontal" className="gap-3 justify-content-end">
              <Button type="submit" className="order-2">
                Save
              </Button>
              {backLink && (
                <Button
                  variant="outline-secondary"
                  className="order-1"
                  as={Link}
                  to={backLink}
                >
                  Cancel
                </Button>
              )}
            </Stack>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};
