import { Formik, useFormikContext } from "formik";
import { useEffect, useRef } from "react";
import { Button, Form, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import { diets, prepTimes, seasons, sourceTypes } from "../constants.js";
import {
  Checkbox,
  RadioButton,
  SelectInput,
  TagsInput,
  TextArea,
  TextInput,
  TextInputAutocomplete,
} from "./form.js";

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

  const handleSubmit = async (recipeInput, { setSubmitting }) => {
    try {
      await onSubmit(cleanupRecipeInput(recipeInput));
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

            <div className="position-relative">
              <div className="fw-bold form-label">Seasons</div>
              <Stack
                direction="horizontal"
                className="justify-content-between align-items-start"
              >
                <Checkbox
                  name={`seasons.${seasons.SPRING}`}
                  label="Spring"
                  labelAddition="Mar—May"
                />
                <Checkbox
                  name={`seasons.${seasons.SUMMER}`}
                  label="Summer"
                  labelAddition="Jun—Aug"
                />
                <Checkbox
                  name={`seasons.${seasons.FALL}`}
                  label="Fall"
                  labelAddition="Sep—Nov"
                />
                <Checkbox
                  name={`seasons.${seasons.WINTER}`}
                  label="Winter"
                  labelAddition="Dec—Feb"
                />
              </Stack>
              {(formik.touched.seasons?.[seasons.SPRING] ||
                formik.touched.seasons?.[seasons.SUMMER] ||
                formik.touched.seasons?.[seasons.FALL] ||
                formik.touched.seasons?.[seasons.WINTER]) &&
                formik.errors.seasons && (
                  <div className="invalid-tooltip d-block">
                    {formik.errors.seasons}
                  </div>
                )}
            </div>

            <TagsInput name="tags" label="Tags" />

            <TextArea name="notes" label="Notes" />

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
