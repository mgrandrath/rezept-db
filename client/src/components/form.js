import { useEffect, useRef } from "react";
import { Button, Form, Stack } from "react-bootstrap";

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
    <Stack>
      {value?.length > 0 && (
        <ul>
          {value.map((tag) => (
            <li key={tag}>
              {tag}{" "}
              <Button type="button" onClick={removeTag(tag)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Form.Control type="text" name="tag" form={formIdRef.current} />
      <Button type="submit" form={formIdRef.current}>
        Add tag
      </Button>
    </Stack>
  );
};
