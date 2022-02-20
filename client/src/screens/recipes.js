import { Link, useSearchParams } from "react-router-dom";
import { Formik } from "formik";
import {
  Alert,
  Button,
  Col,
  Form,
  ListGroup,
  Row,
  Stack,
} from "react-bootstrap";
import { useRecipes } from "../api.js";
import { paths } from "../paths.js";
import { safeGeneratePath } from "../util/url.js";
import { diets } from "../constants.js";

const searchParamsToObject = (urlSearchParams) =>
  Object.fromEntries(urlSearchParams.entries());

const RecipesFilter = (props) => {
  const { initialValues, onSubmit, onReset } = props;

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formik) => (
        <Form onSubmit={formik.handleSubmit}>
          <Stack gap={3}>
            <Form.Group controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" {...formik.getFieldProps("name")} />
            </Form.Group>

            <Form.Group controlId="maxDiet">
              <Form.Label>Diet</Form.Label>
              <Form.Select {...formik.getFieldProps("maxDiet")}>
                <option value={diets.OMNIVORE}>Omnivore</option>
                <option value={diets.VEGETARIAN}>Vegetarian</option>
                <option value={diets.VEGAN}>Vegan</option>
              </Form.Select>
            </Form.Group>

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

const RecipesList = (props) => {
  const { filter } = props;
  const recipesQuery = useRecipes(filter);

  if (recipesQuery.isLoading) {
    return <div>Loading…</div>;
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
      {recipesQuery.data.map(({ recipeId, name }) => (
        <ListGroup.Item
          key={recipeId}
          className="p-3"
          as={Link}
          to={safeGeneratePath(paths.recipe, { recipeId })}
        >
          <div className="fs-5">{name}</div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

const Recipes = () => {
  const defaultValues = { name: "", maxDiet: diets.OMNIVORE };
  const [filterParams, setFilterParams] = useSearchParams(defaultValues);
  const filter = searchParamsToObject(filterParams);
  const setFilter = (filter) => setFilterParams(filter, { replace: true });
  const resetFilter = () => setFilter(defaultValues);

  return (
    <div className="mb-5">
      <h1 className="mb-5">Find recipe</h1>
      <Row className="g-5">
        <Col xs={12} md={5} lg={4}>
          <RecipesFilter
            initialValues={filter}
            onSubmit={setFilter}
            onReset={resetFilter}
          />
        </Col>
        <Col md={{ offset: 1 }}>
          <RecipesList filter={filter} />
        </Col>
      </Row>
    </div>
  );
};

export default Recipes;
