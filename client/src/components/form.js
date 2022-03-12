import { useEffect, useRef } from "react";
import classNames from "classnames";
import { Button, Form, ListGroup, Stack } from "react-bootstrap";
import { Trash as DeleteIcon } from "bootstrap-icons-react";
import { useAutocomplete } from "../api.js";
import { useField } from "formik";

const randomId = () => Math.random().toString(36).substring(2);

const removeDuplicates = (array) => Array.from(new Set(array));

export const TextInput = (props) => {
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

export const Autocomplete = (props) => {
  const { acAttribute, ...inputProps } = props;

  const autocompleteQuery = useAutocomplete(acAttribute);
  const datalistIdRef = useRef(`autocomplete-${randomId()}`);
  const defaultInputProps = {
    type: "text",
    autoComplete: "off",
  };

  return (
    <>
      <Form.Control
        {...defaultInputProps}
        {...inputProps}
        list={datalistIdRef.current}
      />
      <datalist id={datalistIdRef.current}>
        {autocompleteQuery.data?.map?.((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </>
  );
};

export const TextInputAutocomplete = (props) => {
  const {
    className,
    label,
    labelClass = "fw-bold",
    acAttribute,
    ...inputProps
  } = props;

  const idRef = useRef(`text-input-autocomplete-${randomId()}`);
  const [formikProps, meta] = useField(inputProps);
  const defaultInputProps = {
    autoComplete: "off",
    isInvalid: meta.touched && meta.error,
    acAttribute,
  };

  return (
    <Form.Group
      controlId={idRef.current}
      className={classNames(className, "position-relative")}
    >
      <Form.Label className={labelClass}>{label}</Form.Label>
      <Autocomplete {...defaultInputProps} {...inputProps} {...formikProps} />
      <Form.Control.Feedback tooltip type="invalid">
        {meta.error}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

export const TextArea = (props) => {
  const { className, label, ...inputProps } = props;

  const idRef = useRef(`textarea-${randomId()}`);
  const [formikProps, meta] = useField(inputProps);
  const defaultInputProps = {
    as: "textarea",
    isInvalid: meta.touched && meta.error,
  };

  return (
    <Form.Group controlId={idRef.current}>
      <Form.Label className="fw-bold">{label}</Form.Label>
      <Form.Control {...defaultInputProps} {...inputProps} {...formikProps} />
      <Form.Control.Feedback tooltip type="invalid">
        {meta.error}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

export const SelectInput = (props) => {
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

export const RadioButton = (props) => {
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

export const Checkbox = (props) => {
  const { label, labelAddition, ...inputProps } = props;

  const idRef = useRef(`checkbox-${randomId()}`);
  const [formikProps, meta] = useField({ ...props, type: "checkbox" });
  const defaultInputProps = {
    type: "checkbox",
    isInvalid: meta.touched && meta.error,
  };

  return (
    <Form.Group controlId={idRef.current}>
      <Form.Check>
        <Form.Check.Input
          {...defaultInputProps}
          {...inputProps}
          {...formikProps}
        />
        <Form.Check.Label>{label}</Form.Check.Label>
        {labelAddition && (
          <Form.Text className="d-block">{labelAddition}</Form.Text>
        )}
      </Form.Check>
    </Form.Group>
  );
};

export const TagsInput = (props) => {
  const { name, value, onChange } = props;

  const formIdRef = useRef(`tags-input-${randomId()}`);
  const nameRef = useRef();
  nameRef.current = name;
  const valueRef = useRef();
  valueRef.current = value ?? [];
  const onChangeRef = useRef();
  onChangeRef.current = onChange ?? (() => {});

  useEffect(() => {
    const handleSubmit = (event) => {
      event.preventDefault();

      const input = event.target.elements.tag;
      const tag = input.value.trim();
      if (!tag) {
        return;
      }

      const oldTags = valueRef.current;
      const newTags = oldTags.concat([tag]);

      onChangeRef.current({
        target: {
          name: nameRef.current,
          value: removeDuplicates(newTags),
        },
      });
      input.value = "";
    };
    const form = document.createElement("form");
    form.setAttribute("id", formIdRef.current);
    form.addEventListener("submit", handleSubmit);
    document.body.appendChild(form);

    return () => {
      form.remove();
    };
  }, []);

  const removeTag = (tagToRemove) => () => {
    onChangeRef.current({
      target: {
        name: nameRef.current,
        value: valueRef.current.filter((tag) => tag !== tagToRemove),
      },
    });
  };

  return (
    <Stack gap={3}>
      {value?.length > 0 && (
        <ListGroup>
          {value.map((tag) => (
            <ListGroup.Item key={tag}>
              <Stack direction="horizontal" gap={3}>
                <span className="me-auto">{tag}</span>
                <Button type="button" variant="light" onClick={removeTag(tag)}>
                  <DeleteIcon />
                  <span className="visually-hidden">Remove</span>
                </Button>
              </Stack>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      <Stack direction="horizontal" gap={3}>
        <Autocomplete
          className="me-auto"
          name="tag"
          form={formIdRef.current}
          acAttribute="tag"
        />
        <Button
          type="submit"
          variant="outline-primary"
          form={formIdRef.current}
          className="text-nowrap"
        >
          Add tag
        </Button>
      </Stack>
    </Stack>
  );
};
