import classNames from "classnames";
import { Link } from "react-router-dom";
import { Formik } from "formik";
import {
  Alert,
  Button,
  Col,
  Form,
  ListGroup,
  Pagination,
  Row,
  Spinner,
  Stack,
} from "react-bootstrap";
import { useRecipes } from "../api";
import { recipeRoute } from "../routes";
import {
  dietLabels,
  diets,
  prepTimes,
  seasonLabels,
  seasons,
  sortOrders,
} from "../constants";
import { useUrlState, useRerenderChild } from "../util/react";
import {
  Checkbox,
  SelectInput,
  TagsInput,
  TextInput,
} from "../components/form";
import {
  type RecipeFilter,
  type Diet as TDiet,
  type PrepTime as TPrepTime,
} from "../types";

interface RecipesFilterProps {
  filter: RecipeFilter;
  setFilter: (filter: RecipeFilter) => void;
  onReset: () => void;
}

const RecipesFilter = (props: RecipesFilterProps) => {
  const { filter, setFilter, onReset } = props;

  return (
    <Formik
      enableReinitialize
      initialValues={{ ...filter, page: 1 }}
      onSubmit={setFilter}
    >
      {(formik) => (
        <Form onSubmit={formik.handleSubmit}>
          <Stack gap={3}>
            <TextInput name="name" label="Name" />

            <SelectInput name="maxDiet" label="Diet">
              <option value={diets.OMNIVORE}>{dietLabels.OMNIVORE}</option>
              <option value={diets.VEGETARIAN}>{dietLabels.VEGETARIAN}</option>
              <option value={diets.VEGAN}>{dietLabels.VEGAN}</option>
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
              <Stack
                direction="horizontal"
                className="form-label justify-content-between"
              >
                <div className="fw-bold">Seasons</div>
                <Button
                  variant="link"
                  onClick={() => {
                    Object.keys(seasons).forEach((season) => {
                      formik.setFieldValue(`seasons.${season}`, true);
                    });
                  }}
                >
                  Select all
                </Button>
              </Stack>
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

interface CircleProps {
  className?: string;
  color: string;
}

const Circle = (props: CircleProps) => {
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

interface PrepTimeProps {
  children: TPrepTime;
}

const PrepTime = (props: PrepTimeProps) => {
  const { children } = props;

  const filled = "#2e3236";
  const empty = "#d1d1d1";

  const circles = (...colors: string[]) =>
    colors.map((color, index) => (
      <Circle key={index} className="me-1" color={color} />
    ));

  const prepTime = (text: string, circleStates: string[]) => (
    <div>
      {circles(...circleStates)} {text}
    </div>
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

interface DietProps {
  className?: string;
  children: TDiet;
}

const Diet = (props: DietProps) => {
  const { className, children } = props;

  switch (children) {
    case diets.VEGAN:
      return (
        <div className={className}>
          Vegan <Circle color="#34a853" />
        </div>
      );

    case diets.VEGETARIAN:
      return (
        <div className={className}>
          Vegetarian <Circle color="#fbbc04" />
        </div>
      );

    case diets.OMNIVORE:
      return (
        <div className={className}>
          Omnivore <Circle color="#ea4335" />
        </div>
      );

    default:
      return null;
  }
};

interface RecipeItemsProps {
  filter: RecipeFilter;
}

const RecipeItems = (props: RecipeItemsProps) => {
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

  if (!recipesQuery.isSuccess) {
    return <Alert variant="danger">Failed to load recipes :-(</Alert>;
  }

  const {
    recipes,
    filter: { numberOfItems, numberOfMatches },
  } = recipesQuery.data;

  if (recipes.length === 0) {
    return (
      <Alert variant="primary">
        Your filter settings did not yield any matching recipes
      </Alert>
    );
  }

  return (
    <>
      {numberOfMatches < numberOfItems && (
        <Alert variant="primary">
          Your filter settings match {numberOfMatches} out of {numberOfItems}{" "}
          recipes
        </Alert>
      )}
      <ListGroup variant="flush">
        {recipes.map((recipe) => (
          <ListGroup.Item key={recipe.recipeId} className="p-3" action as="div">
            <Link
              className="d-block fs-4 mb-2 text-reset text-decoration-none stretched-link"
              to={recipeRoute.url({ recipeId: recipe.recipeId })}
            >
              {recipe.name}
            </Link>
            <Stack direction="horizontal" className="text-muted">
              <PrepTime>{recipe.prepTime}</PrepTime>
              <Diet className="ms-auto">{recipe.diet}</Diet>
            </Stack>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </>
  );
};

interface RecipeSortSelectionProps {
  className?: string;
  filter: RecipeFilter;
  setFilter: (filter: RecipeFilter) => void;
}

const RecipeSortSelection = (props: RecipeSortSelectionProps) => {
  const { className, filter, setFilter } = props;

  return (
    <Stack className={className} direction="horizontal">
      <Formik
        enableReinitialize
        initialValues={{ ...filter, page: 1 }}
        onSubmit={setFilter}
      >
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
  );
};

interface RecipePaginationProps {
  filter: RecipeFilter;
  setFilter: (filter: RecipeFilter) => void;
}

const RecipePagination = (props: RecipePaginationProps) => {
  const { filter, setFilter } = props;
  const recipesQuery = useRecipes(filter);

  if (
    recipesQuery.isLoading ||
    recipesQuery.isError ||
    !recipesQuery.isSuccess
  ) {
    return null;
  }

  const {
    pagination: { currentPage, numberOfPages },
  } = recipesQuery.data;

  if (numberOfPages < 2) {
    return null;
  }

  const pages = Array.from(new Array(numberOfPages))
    .map((value, index) => ({ page: index + 1 }))
    .map(({ page }) => ({ page, isActive: page === currentPage }))
    .map(({ page, isActive }) => (
      <li key={page} className={classNames("page-item", { active: isActive })}>
        {isActive ? (
          <span className="page-link">{page}</span>
        ) : (
          <Button
            className="page-link"
            onClick={() => {
              setFilter({ ...filter, page });
              window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
            }}
          >
            {page}
          </Button>
        )}
      </li>
    ));

  return (
    <div className="mt-5 d-flex justify-content-center">
      <Pagination>{pages}</Pagination>
    </div>
  );
};

interface RecipesListProps {
  filter: RecipeFilter;
  setFilter: (filter: RecipeFilter) => void;
}

const RecipesList = (props: RecipesListProps) => {
  const { filter, setFilter } = props;

  return (
    <>
      <RecipeSortSelection
        className="mb-2"
        filter={filter}
        setFilter={setFilter}
      />
      <RecipeItems filter={filter} />
      <RecipePagination filter={filter} setFilter={setFilter} />
    </>
  );
};

const Recipes = () => {
  const currentMonth = new Date().getMonth() + 1;
  const defaultFilter: RecipeFilter = {
    page: 1,
    name: "",
    maxDiet: diets.OMNIVORE,
    maxPrepTime: prepTimes.OVER_120_MINUTES,
    tags: [],
    seasons: {
      [seasons.SPRING]: [3, 4, 5].includes(currentMonth),
      [seasons.SUMMER]: [6, 7, 8].includes(currentMonth),
      [seasons.FALL]: [9, 10, 11].includes(currentMonth),
      [seasons.WINTER]: [12, 1, 2].includes(currentMonth),
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
        <Col xs={12} md={8} lg={5} xxl={4}>
          <RecipesFilter
            key={formKey}
            filter={filter}
            setFilter={setFilter}
            onReset={resetFilter}
          />
          8{" "}
        </Col>
        <Col md={12} lg={7} xxl={{ offset: 1 }}>
          <RecipesList filter={filter} setFilter={setFilter} />
        </Col>
      </Row>
    </div>
  );
};

export default Recipes;
