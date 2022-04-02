import { forwardRef, useEffect, useRef, useId } from "react";
import classNames from "classnames";
import { Button, Form, ListGroup, Stack } from "react-bootstrap";
import { Trash as DeleteIcon } from "bootstrap-icons-react";
import { useAutocomplete } from "../api.js";
import { useField } from "formik";

const removeDuplicates = (array) => Array.from(new Set(array));

export const TextInput = (props) => {
  const { className, label, labelClass = "fw-bold", ...inputProps } = props;

  const id = useId();
  const [formikProps, meta] = useField(inputProps);
  const defaultInputProps = {
    autoComplete: "off",
    isInvalid: meta.touched && meta.error,
  };

  return (
    <Form.Group
      controlId={id}
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

export const Autocomplete = forwardRef((props, forwardedRef) => {
  const { acAttribute, ...inputProps } = props;

  const autocompleteQuery = useAutocomplete(acAttribute);
  const datalistId = useId();
  const defaultInputProps = {
    type: "text",
    autoComplete: "off",
  };

  return (
    <>
      <Form.Control
        {...defaultInputProps}
        {...inputProps}
        list={datalistId}
        ref={forwardedRef}
      />
      <datalist id={datalistId}>
        {autocompleteQuery.data?.map?.((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </>
  );
});

export const TextInputAutocomplete = (props) => {
  const {
    className,
    label,
    labelClass = "fw-bold",
    acAttribute,
    ...inputProps
  } = props;

  const id = useId();
  const [formikProps, meta] = useField(inputProps);
  const defaultInputProps = {
    autoComplete: "off",
    isInvalid: meta.touched && meta.error,
    acAttribute,
  };

  return (
    <Form.Group
      controlId={id}
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

  const id = useId();
  const [formikProps, meta] = useField(inputProps);
  const defaultInputProps = {
    as: "textarea",
    isInvalid: meta.touched && meta.error,
  };

  return (
    <Form.Group controlId={id}>
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

  const id = useId();
  const [formikProps, meta] = useField(inputProps);
  const defaultInputProps = {
    isInvalid: meta.touched && meta.error,
  };

  return (
    <Form.Group
      controlId={id}
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
  const id = useId();
  const [formikProps, meta] = useField({ ...props, type: "radio" });
  const defaultInputProps = {
    type: "radio",
    isInvalid: meta.touched && meta.error,
  };

  return (
    <Form.Group controlId={id}>
      <Form.Check {...defaultInputProps} {...props} {...formikProps} />
    </Form.Group>
  );
};

export const Checkbox = (props) => {
  const { label, labelAddition, ...inputProps } = props;

  const id = useId();
  const [formikProps, meta] = useField({ ...props, type: "checkbox" });
  const defaultInputProps = {
    type: "checkbox",
    isInvalid: meta.touched && meta.error,
  };

  return (
    <Form.Group controlId={id}>
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
  const { name, label } = props;

  const [{ value, onChange }] = useField(props);

  const controlId = useId();
  const formId = useId();
  const inputRef = useRef();

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
    form.setAttribute("id", formId);
    form.addEventListener("submit", handleSubmit);
    document.body.appendChild(form);

    return () => {
      form.remove();
    };
  }, [formId]);

  const handleKeyDown = (event) => {
    // Add tag to list when ',' key is pressed
    if (event.key === ",") {
      event.preventDefault();
      event.target.form.requestSubmit();

      // Close autocomplete overlay
      inputRef.current.blur();
      inputRef.current.focus();
    }
  };

  const removeTag = (tagToRemove) => () => {
    onChangeRef.current({
      target: {
        name: nameRef.current,
        value: valueRef.current.filter((tag) => tag !== tagToRemove),
      },
    });
  };

  return (
    <Form.Group controlId={controlId}>
      <Form.Label className="fw-bold">{label}</Form.Label>
      <Stack gap={3}>
        {value?.length > 0 && (
          <ListGroup>
            {value.map((tag) => (
              <ListGroup.Item key={tag}>
                <Stack direction="horizontal" gap={3}>
                  <span className="me-auto">{tag}</span>
                  <Button
                    type="button"
                    variant="light"
                    onClick={removeTag(tag)}
                  >
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
            ref={inputRef}
            className="me-auto"
            name="tag"
            form={formId}
            acAttribute="tag"
            onKeyDown={handleKeyDown}
          />
          <Button
            type="submit"
            variant="outline-primary"
            form={formId}
            className="text-nowrap"
          >
            Add tag
          </Button>
        </Stack>
      </Stack>
    </Form.Group>
  );
};
