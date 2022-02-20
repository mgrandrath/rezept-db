import { fireEvent, screen, getByText } from "@testing-library/react";

export const enterTextValue = (label, value) => {
  const input = screen.getByRole("textbox", { name: label });
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

export const clickButton = (label) => {
  const button = screen.getByRole("button", { name: label });
  fireEvent.click(button);
};
