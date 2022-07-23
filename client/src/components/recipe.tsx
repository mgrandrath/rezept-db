import { Formik, type FormikHelpers, useFormikContext } from "formik";
import { useEffect, useRef } from "react";
import { Button, Card, Form, Stack, Tab, Tabs } from "react-bootstrap";
import { Link, type To } from "react-router-dom";
import {
  dietLabels,
  diets,
  prepTimeLabels,
  prepTimes,
  seasonLabels,
  seasons,
  sourceTypes,
} from "../constants";
import {
  type RecipeInput,
  type Tags,
  type Diet,
  type PrepTime,
  type RecipeName,
  type Seasons,
  type SourceType,
  type RecipeNotes,
  type RecipeSource,
} from "../types";
import {
  Checkbox,
  RadioButton,
  SelectInput,
  TagsInput,
  TextInput,
  TextInputAutocomplete,
} from "./form";
import { Markdown } from "./markdown";

const isValidUrl = (candidate: string = "") => {
  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
};

interface RecipeFormValues {
  name: RecipeName;
  source: {
    type: SourceType;
    url?: string;
    title?: string;
    page?: number | null;
  };
  diet: Diet | "";
  prepTime: PrepTime | "";
  seasons: Seasons;
  tags: Tags;
  notes: RecipeNotes;
}

interface RecipeFormErrors {
  name?: string;
  source?: {
    url?: string;
    title?: string;
    page?: string;
  };
  diet?: string;
  prepTime?: string;
  seasons?: string;
  notes?: string;
}

const validateRecipeInput = (recipeInput: RecipeFormValues) => {
  const errors: RecipeFormErrors = {};

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

const UpdateSource = (/* props */) => {
  type SetStringFieldValue = (field: string, value: string) => void;
  type SetFieldTouched = (field: string, isTouched: boolean) => void;

  const {
    values: { source: { type } = {} },
    setFieldValue,
    setFieldTouched,
  } = useFormikContext<RecipeFormValues>();

  const setFieldValueRef = useRef<SetStringFieldValue>(() => {});
  setFieldValueRef.current = setFieldValue;

  const setFieldTouchedRef = useRef<SetFieldTouched>(() => {});
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

const cleanupRecipeInput = (
  validatedFormValues: RecipeFormValues
): RecipeInput => {
  let source: RecipeSource;
  switch (validatedFormValues.source.type) {
    case sourceTypes.ONLINE:
      source = {
        type: sourceTypes.ONLINE,
        url: validatedFormValues.source.url as string,
      };
      break;

    case sourceTypes.OFFLINE:
      source = {
        type: sourceTypes.OFFLINE,
        title: validatedFormValues.source.title as string,
        page: Number(validatedFormValues.source.page),
      };
      break;
  }

  return {
    name: validatedFormValues.name,
    source,
    diet: validatedFormValues.diet as Diet,
    prepTime: validatedFormValues.prepTime as PrepTime,
    seasons: validatedFormValues.seasons,
    tags: validatedFormValues.tags,
    notes: validatedFormValues.notes,
  };
};

interface RecipeInputFormProps {
  recipeInput: RecipeFormValues;
  onSubmit: (recipeInput: RecipeInput) => Promise<void>;
  backLink: To;
}

export const RecipeInputForm = (props: RecipeInputFormProps) => {
  const { recipeInput, onSubmit, backLink } = props;

  const handleSubmit = async (
    validatedFormValues: RecipeFormValues,
    { setSubmitting }: FormikHelpers<RecipeFormValues>
  ) => {
    try {
      await onSubmit(cleanupRecipeInput(validatedFormValues));
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
        <Form noValidate onSubmit={formik.handleSubmit}>
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
              <option value={diets.VEGAN}>{dietLabels.VEGAN}</option>
              <option value={diets.VEGETARIAN}>{dietLabels.VEGETARIAN}</option>
              <option value={diets.OMNIVORE}>{dietLabels.OMNIVORE}</option>
            </SelectInput>

            <SelectInput name="prepTime" label="Preperation time">
              <option value="">Please select</option>
              <option value={prepTimes.UNDER_30_MINUTES}>
                {prepTimeLabels.UNDER_30_MINUTES}
              </option>
              <option value={prepTimes["30_TO_60_MINUTES"]}>
                {prepTimeLabels["30_TO_60_MINUTES"]}
              </option>
              <option value={prepTimes["60_TO_120_MINUTES"]}>
                {prepTimeLabels["60_TO_120_MINUTES"]}
              </option>
              <option value={prepTimes.OVER_120_MINUTES}>
                {prepTimeLabels.OVER_120_MINUTES}
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
                  label={seasonLabels.SPRING}
                  labelAddition="Mar—May"
                />
                <Checkbox
                  name={`seasons.${seasons.SUMMER}`}
                  label={seasonLabels.SUMMER}
                  labelAddition="Jun—Aug"
                />
                <Checkbox
                  name={`seasons.${seasons.FALL}`}
                  label={seasonLabels.FALL}
                  labelAddition="Sep—Nov"
                />
                <Checkbox
                  name={`seasons.${seasons.WINTER}`}
                  label={seasonLabels.WINTER}
                  labelAddition="Dec—Feb"
                />
              </Stack>
              {(formik.touched.seasons?.[seasons.SPRING] ||
                formik.touched.seasons?.[seasons.SUMMER] ||
                formik.touched.seasons?.[seasons.FALL] ||
                formik.touched.seasons?.[seasons.WINTER]) &&
                formik.errors.seasons && (
                  <div className="invalid-tooltip d-block">
                    {formik.errors.seasons as string | undefined}
                  </div>
                )}
            </div>

            <TagsInput name="tags" label="Tags" />

            <Form.Group controlId="notes">
              <Form.Label className="fw-bold">Notes</Form.Label>
              <Tabs
                defaultActiveKey="notes-edit"
                className="mb-2"
                variant="pills"
              >
                <Tab eventKey="notes-edit" title="Edit">
                  <Form.Control
                    as="textarea"
                    rows={8}
                    isInvalid={Boolean(
                      formik.touched.notes && formik.errors.notes
                    )}
                    {...formik.getFieldProps("notes")}
                  />
                  <Form.Control.Feedback tooltip type="invalid">
                    {formik.errors.notes}
                  </Form.Control.Feedback>
                  <Form.Text muted>
                    You can use{" "}
                    <a
                      href="https://www.markdownguide.org/cheat-sheet/"
                      rel="external noopener noreferrer"
                      target="_blank"
                    >
                      markdown
                    </a>{" "}
                    to format your notes
                  </Form.Text>
                </Tab>
                <Tab eventKey="notes-preview" title="Preview">
                  <Card>
                    <Card.Body>
                      <Markdown>{formik.values.notes}</Markdown>
                    </Card.Body>
                  </Card>
                </Tab>
              </Tabs>
            </Form.Group>

            <Stack direction="horizontal" className="gap-3 justify-content-end">
              <Button
                type="submit"
                className="order-2"
                disabled={formik.isSubmitting}
              >
                Save
              </Button>
              {backLink && (
                <Link
                  className="btn btn-outline-secondary order-1"
                  to={backLink}
                >
                  Cancel
                </Link>
              )}
            </Stack>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};
