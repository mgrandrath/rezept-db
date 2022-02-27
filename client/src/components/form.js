import { useEffect, useRef } from "react";
import { Button, Form, ListGroup, Stack } from "react-bootstrap";
import { Trash as DeleteIcon } from "bootstrap-icons-react";

const randomId = () => Math.random().toString(36).substring(2);

const removeDuplicates = (array) => Array.from(new Set(array));

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
      const oldValue = valueRef.current;
      const newValue = oldValue.concat([input.value]);

      onChangeRef.current({
        target: {
          name: nameRef.current,
          value: removeDuplicates(newValue),
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
        <Form.Control
          className="me-auto"
          type="text"
          name="tag"
          form={formIdRef.current}
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
