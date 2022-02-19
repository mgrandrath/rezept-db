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
          <Form.Group className="mb-4" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" {...formik.getFieldProps("name")} />
          </Form.Group>
          <Stack direction="horizontal" gap={3}>
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
  const defaultValues = { name: "" };
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
