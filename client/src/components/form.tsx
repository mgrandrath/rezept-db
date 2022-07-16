import {
  forwardRef,
  useEffect,
  useRef,
  useId,
  type ForwardedRef,
  type ReactNode,
  type KeyboardEvent,
  type InputHTMLAttributes,
} from "react";
import classNames from "classnames";
import {
  Button,
  Form,
  ListGroup,
  Stack,
  type FormCheckProps,
  type FormControlProps,
  type FormSelectProps,
} from "react-bootstrap";
import { type FormCheckInputProps } from "react-bootstrap/esm/FormCheckInput";
import { Trash as DeleteIcon } from "bootstrap-icons-react";
import { type FieldHookConfig, useField } from "formik";
import { useAutocomplete } from "../api";
import { type AutocompleteAttribute } from "../types";

const removeDuplicates = <T,>(array: Array<T>): Array<T> =>
  Array.from(new Set(array));

type TextInputProps = {
  className?: string;
  label: ReactNode;
  labelClass?: string;
} & FieldHookConfig<string>;

export const TextInput = (props: TextInputProps) => {
  const { className, label, labelClass = "fw-bold", ...inputProps } = props;

  const id = useId();
  const [formikProps, meta] = useField(inputProps);
  const defaultInputProps = {
    autoComplete: "off",
    isInvalid: Boolean(meta.touched && meta.error),
  };
  const formControlProps = {
    ...defaultInputProps,
    ...inputProps,
    ...formikProps,
  } as FormControlProps;

  return (
    <Form.Group
      controlId={id}
      className={classNames(className, "position-relative")}
    >
      <Form.Label className={labelClass}>{label}</Form.Label>
      <Form.Control {...formControlProps} />
      <Form.Control.Feedback tooltip type="invalid">
        {meta.error}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

type AutocompleteProps = {
  acAttribute: AutocompleteAttribute;
} & FormControlProps &
  InputHTMLAttributes<HTMLInputElement>;

export const Autocomplete = forwardRef(
  (props: AutocompleteProps, forwardedRef: ForwardedRef<HTMLInputElement>) => {
    const { acAttribute, ...inputProps } = props;

    const autocompleteQuery = useAutocomplete(acAttribute);
    const datalistId = useId();
    const defaultInputProps = {
      type: "text" as const,
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
          {autocompleteQuery.data?.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </>
    );
  }
);

type TextInputAutocompleteProps = {
  className?: string;
  label: ReactNode;
  labelClass?: string;
  acAttribute: AutocompleteAttribute;
} & FieldHookConfig<string>;

export const TextInputAutocomplete = (props: TextInputAutocompleteProps) => {
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
    isInvalid: Boolean(meta.touched && meta.error),
    acAttribute,
  };
  const autocompleteProps = {
    ...defaultInputProps,
    ...inputProps,
    ...formikProps,
  } as AutocompleteProps;

  return (
    <Form.Group
      controlId={id}
      className={classNames(className, "position-relative")}
    >
      <Form.Label className={labelClass}>{label}</Form.Label>
      <Autocomplete {...autocompleteProps} />
      <Form.Control.Feedback tooltip type="invalid">
        {meta.error}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

type TextAreaProps = {
  className?: string;
  label: ReactNode;
} & FieldHookConfig<string>;

export const TextArea = (props: TextAreaProps) => {
  const { className, label, ...inputProps } = props;

  const id = useId();
  const [formikProps, meta] = useField(inputProps);
  const defaultInputProps = {
    as: "textarea" as const,
    isInvalid: Boolean(meta.touched && meta.error),
  };
  const formControlProps = {
    ...defaultInputProps,
    ...inputProps,
    ...formikProps,
  } as FormControlProps;

  return (
    <Form.Group controlId={id}>
      <Form.Label className="fw-bold">{label}</Form.Label>
      <Form.Control {...formControlProps} />
      <Form.Control.Feedback tooltip type="invalid">
        {meta.error}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

type SelectInputProps = {
  className?: string;
  label: ReactNode;
  children: ReactNode;
} & FieldHookConfig<string>;

export const SelectInput = (props: SelectInputProps) => {
  const { label, children, className, ...inputProps } = props;

  const id = useId();
  const [formikProps, meta] = useField(inputProps);
  const defaultInputProps = {
    isInvalid: Boolean(meta.touched && meta.error),
  };
  const selectProps = {
    ...defaultInputProps,
    ...inputProps,
    ...formikProps,
  } as FormSelectProps;

  return (
    <Form.Group
      controlId={id}
      className={classNames(className, "position-relative")}
    >
      <Form.Label className="fw-bold">{label}</Form.Label>
      <Form.Select {...selectProps}>{children}</Form.Select>
      <Form.Control.Feedback tooltip type="invalid">
        {meta.error}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

type RadioButtonProps = {} & FieldHookConfig<string>;

export const RadioButton = (props: RadioButtonProps) => {
  const id = useId();
  const [formikProps, meta] = useField({
    ...props,
    type: "radio" as const,
  });
  const defaultInputProps = {
    type: "radio" as const,
    isInvalid: Boolean(meta.touched && meta.error),
  };
  const radioProps = {
    ...defaultInputProps,
    ...props,
    ...formikProps,
  } as FormCheckProps;

  return (
    <Form.Group controlId={id}>
      <Form.Check {...radioProps} />
    </Form.Group>
  );
};

type CheckboxProps = {
  label: ReactNode;
  labelAddition?: ReactNode;
} & FieldHookConfig<string>;

export const Checkbox = (props: CheckboxProps) => {
  const { label, labelAddition, ...inputProps } = props;

  const id = useId();
  const [formikProps, meta] = useField({
    ...props,
    type: "checkbox" as const,
  });
  const defaultInputProps = {
    isInvalid: Boolean(meta.touched && meta.error),
  };
  const checkboxProps = {
    ...defaultInputProps,
    ...inputProps,
    ...formikProps,
  } as FormCheckInputProps;

  return (
    <Form.Group controlId={id}>
      <Form.Check>
        <Form.Check.Input {...checkboxProps} />
        <Form.Check.Label>{label}</Form.Check.Label>
        {labelAddition && (
          <Form.Text className="d-block">{labelAddition}</Form.Text>
        )}
      </Form.Check>
    </Form.Group>
  );
};

type TagsInputProps = {
  name: string;
  label: ReactNode;
};

export const TagsInput = (props: TagsInputProps) => {
  interface ChangeEvent {
    target: { name: string; value: string[] };
  }

  const { name, label } = props;

  const [{ value, onChange }] = useField<string[]>(props);

  const controlId = useId();
  const formId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const nameRef = useRef<string>("");
  nameRef.current = name;

  const valueRef = useRef<string[]>([]);
  valueRef.current = value ?? [];

  const onChangeRef = useRef<(event: ChangeEvent) => void>(() => {});
  onChangeRef.current = onChange;

  useEffect(() => {
    const handleSubmit = (event: SubmitEvent) => {
      event.preventDefault();

      const target = event.target as HTMLFormElement;
      const input = target.elements.namedItem("tag") as HTMLInputElement;
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

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // Add tag to list when ',' key is pressed
    if (event.key === ",") {
      event.preventDefault();

      const target = event.target as HTMLInputElement;
      target.form?.requestSubmit();

      // Close autocomplete overlay
      inputRef.current?.blur();
      inputRef.current?.focus();
    }
  };

  const removeTag = (tagToRemove: string) => () => {
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
