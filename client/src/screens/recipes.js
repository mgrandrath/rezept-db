import classNames from "classnames";
import { Link } from "react-router-dom";
import { Formik } from "formik";
import {
  Alert,
  Button,
  Col,
  Form,
  ListGroup,
  OverlayTrigger,
  Row,
  Spinner,
  Stack,
  Tooltip,
} from "react-bootstrap";
import { useRecipes } from "../api.js";
import { paths } from "../paths.js";
import { safeGeneratePath } from "../util/url.js";
import { diets, prepTimes, seasons, sortOrders } from "../constants.js";
import { useUrlState, useRerenderChild } from "../util/react.js";
import {
  Checkbox,
  SelectInput,
  TagsInput,
  TextInput,
} from "../components/form.js";

const RecipesFilter = (props) => {
  const { filter, onSubmit, onReset } = props;

  return (
    <Formik enableReinitialize initialValues={filter} onSubmit={onSubmit}>
      {(formik) => (
        <Form onSubmit={formik.handleSubmit}>
          <Stack gap={3}>
            <TextInput name="name" label="Name" />

            <SelectInput name="maxDiet" label="Diet">
              <option value={diets.OMNIVORE}>Omnivore</option>
              <option value={diets.VEGETARIAN}>Vegetarian</option>
              <option value={diets.VEGAN}>Vegan</option>
            </SelectInput>

            <SelectInput name="maxPrepTime" label="Maximum preperation time">
              <option value={prepTimes.OVER_120_MINUTES}>none</option>
              <option value={prepTimes["60_TO_120_MINUTES"]}>
                120 minutes
              </option>
              <option value={prepTimes["30_TO_60_MINUTES"]}>60 minutes</option>
              <option value={prepTimes.UNDER_30_MINUTES}>30 minutes</option>
            </SelectInput>

            <div>
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
            </div>

            <TagsInput name="tags" label="Tags" />

            <Stack direction="horizontal" gap={3} className="mt-1">
              <Button
                className="ms-auto"
                type="button"
                variant="outline-secondary"
                onClick={onReset}
              >
                Reset all filters
              </Button>
              <Button type="submit">Apply filters</Button>
            </Stack>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};

const Circle = (props) => {
  const { className, color } = props;

  const style = {
    width: "1em",
    height: "1em",
    backgroundColor: color,
  };

  return (
    <div
      className={classNames(
        className,
        "d-inline-block align-text-bottom rounded-circle"
      )}
      style={style}
    />
  );
};

const PrepTime = (props) => {
  const { children } = props;

  const filled = "#2e3236";
  const empty = "#d1d1d1";

  const circles = (...colors) =>
    colors.map((color, index) => (
      <Circle key={index} className="me-1" color={color} />
    ));

  const prepTime = (text, circleStates) => (
    <OverlayTrigger placement="top" overlay={<Tooltip>{text}</Tooltip>}>
      <div className="d-inline-block">{circles(...circleStates)}</div>
    </OverlayTrigger>
  );

  switch (children) {
    case prepTimes.UNDER_30_MINUTES:
      return prepTime("under 30 minutes", [filled, empty, empty, empty]);

    case prepTimes["30_TO_60_MINUTES"]:
      return prepTime("30—60 minutes", [filled, filled, empty, empty]);

    case prepTimes["60_TO_120_MINUTES"]:
      return prepTime("60—120 minutes", [filled, filled, filled, empty]);

    case prepTimes.OVER_120_MINUTES:
      return prepTime("over 120 minutes", [filled, filled, filled, filled]);

    default:
      return null;
  }
};

const Diet = (props) => {
  const { children } = props;

  switch (children) {
    case diets.VEGAN:
      return (
        <div>
          Vegan <Circle color="#34a853" />
        </div>
      );

    case diets.VEGETARIAN:
      return (
        <div>
          Vegetarian <Circle color="#fbbc04" />
        </div>
      );

    case diets.OMNIVORE:
      return (
        <div>
          Omnivore <Circle color="#ea4335" />
        </div>
      );

    default:
      return null;
  }
};

const RecipeItems = (props) => {
  const { filter } = props;
  const recipesQuery = useRecipes(filter);

  if (recipesQuery.isLoading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading…</span>
        </Spinner>
      </div>
    );
  }

  if (recipesQuery.isError) {
    return <Alert variant="danger">Error: {recipesQuery.error.message}</Alert>;
  }

  if (recipesQuery.data.length === 0) {
    return (
      <Alert variant="info">
        Your filter settings did not yield any matching recipes
      </Alert>
    );
  }

  return (
    <ListGroup variant="flush">
      {recipesQuery.data.map((recipe) => (
        <ListGroup.Item
          key={recipe.recipeId}
          className="p-3"
          action
          as={Link}
          to={safeGeneratePath(paths.recipe, { recipeId: recipe.recipeId })}
        >
          <div className="fs-4 mb-2">{recipe.name}</div>
          <Stack direction="horizontal" className="text-muted">
            <div>
              <span className="me-1">Prep time:</span>{" "}
              <PrepTime>{recipe.prepTime}</PrepTime>
            </div>
            <div className="ms-auto">
              <Diet>{recipe.diet}</Diet>
            </div>
          </Stack>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

const RecipesList = (props) => {
  const { filter, onSubmit } = props;

  return (
    <>
      <Stack direction="horizontal" className="mb-1">
        <Formik enableReinitialize initialValues={filter} onSubmit={onSubmit}>
          {(formik) => (
            <Form className="ms-auto" onSubmit={formik.handleSubmit}>
              <Form.Group controlId="sortBy">
                <Form.Label className="me-2">Sort order</Form.Label>
                <Form.Select
                  value={formik.values.sortBy}
                  className="w-auto d-inline-block"
                  onChange={(event) => {
                    formik.handleChange(event);
                    formik.submitForm();
                  }}
                >
                  <option value={sortOrders.NAME}>Alphabetically</option>
                  <option value={sortOrders.CREATED_AT}>Newest first</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Formik>
      </Stack>

      <RecipeItems filter={filter} />
    </>
  );
};

const Recipes = () => {
  const defaultFilter = {
    name: "",
    maxDiet: diets.OMNIVORE,
    maxPrepTime: prepTimes.OVER_120_MINUTES,
    tags: [],
    seasons: {
      [seasons.SPRING]: true,
      [seasons.SUMMER]: true,
      [seasons.FALL]: true,
      [seasons.WINTER]: true,
    },
    sortBy: sortOrders.NAME,
  };
  const [formKey, rerenderForm] = useRerenderChild();
  const [filter, setFilter] = useUrlState(defaultFilter);

  const resetFilter = () => {
    setFilter((currentFilter) => ({
      ...defaultFilter,
      sortBy: currentFilter.sortBy,
    }));
    rerenderForm();
  };

  return (
    <div className="mb-5">
      <h1 className="mb-5">Find recipe</h1>
      <Row className="g-5">
        <Col xs={12} md={5} lg={4}>
          <RecipesFilter
            key={formKey}
            filter={filter}
            onSubmit={setFilter}
            onReset={resetFilter}
          />
        </Col>
        <Col md={{ offset: 1 }}>
          <RecipesList filter={filter} onSubmit={setFilter} />
        </Col>
      </Row>
    </div>
  );
};

export default Recipes;
