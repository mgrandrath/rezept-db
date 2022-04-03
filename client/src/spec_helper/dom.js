import { fireEvent, screen, getByText } from "@testing-library/react";

export const enterTextValue = (label, value) => {
  const input =
    screen.queryByRole("textbox", { name: label }) ||
    screen.queryByRole("combobox", { name: label });
  if (!input) {
    throw new Error(
      `Unable to find textbox or combobox with a label of '${label}'`
    );
  }
  fireEvent.change(input, { target: { value } });
};

export const enterNumberValue = (label, value) => {
  const input = screen.getByLabelText(label);
  expect(input).toHaveProperty("type", "number");
  fireEvent.change(input, { target: { value } });
};

export const selectOption = (label, optionText) => {
  const input = screen.getByRole("combobox", { name: label });
  const option = getByText(input, optionText);
  const value = option.value ?? optionText;
  fireEvent.change(input, { target: { value } });
};

export const selectOptionValue = (label, optionValue) => {
  const input = screen.getByRole("combobox", { name: label });
  const options = [...input.querySelectorAll("option")];
  expect(options).toContainEqual(
    expect.objectContaining({ value: optionValue })
  );
  fireEvent.change(input, { target: { value: optionValue } });
};

export const clickRadioButton = (label) => {
  const radio = screen.getByRole("radio", { name: label });
  fireEvent.click(radio);
};

export const clickCheckbox = (label) => {
  const checkbox = screen.getByRole("checkbox", { name: label });
  fireEvent.click(checkbox);
};

export const setCheckbox = (label, checked) => {
  const checkbox = screen.getByRole("checkbox", { name: label });
  if (checkbox.checked !== checked) {
    fireEvent.click(checkbox);
  }
};

export const clickButton = (label) => {
  const button = screen.getByRole("button", { name: label });
  fireEvent.click(button);
};
