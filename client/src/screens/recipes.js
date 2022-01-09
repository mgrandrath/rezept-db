import { useState } from "react";
import { Formik } from "formik";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { useRecipes } from "../api.js";

const RecipesFilter = (props) => {
  const { initialValues, onSubmit } = props;

  const handleReset = (formik) => () => {
    formik.resetForm();
    formik.submitForm();
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {(formik) => (
        <Form onSubmit={formik.handleSubmit}>
          <Form.Group className="mb-4" controlId="title">
            <Form.Label>Title</Form.Label>
            <Form.Control type="text" {...formik.getFieldProps("title")} />
          </Form.Group>
          <Stack direction="horizontal" gap={3}>
            <Button
              className="ms-auto"
              type="button"
              variant="outline-secondary"
              onClick={handleReset(formik)}
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
  const recipes = useRecipes(filter);

  if (recipes.isLoading) {
    return <div>Loading…</div>;
  }

  if (recipes.isError) {
    return <div>Error: {recipes.error.message}</div>;
  }

  return (
    <ul>
      {recipes.data.map((recipe) => (
        <li key={recipe.recipeId}>{recipe.title}</li>
      ))}
    </ul>
  );
};

const Recipes = () => {
  const [filter, setFilter] = useState({ title: "" });

  return (
    <div>
      <h1 className="mb-5">Find recipe</h1>
      <Row>
        <Col xs={12} md={5} lg={4} className="mb-3">
          <RecipesFilter initialValues={filter} onSubmit={setFilter} />
        </Col>
        <Col md={{ offset: 1 }}>
          <RecipesList filter={filter} />
        </Col>
      </Row>
    </div>
  );
};

export default Recipes;
