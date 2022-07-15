import { fireEvent, screen, getByText } from "@testing-library/react";

export const enterTextValue = (label: string, value: string) => {
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

export const enterNumberValue = (label: string, value: number) => {
  const input = screen.getByLabelText(label);
  expect(input).toHaveProperty("type", "number");
  fireEvent.change(input, { target: { value } });
};

export const selectOption = (label: string, optionText: string) => {
  const input = screen.getByRole("combobox", { name: label });
  const option = getByText(input, optionText) as HTMLOptionElement;
  const value = option.value ?? optionText;
  fireEvent.change(input, { target: { value } });
};

export const selectOptionValue = (label: string, optionValue: string) => {
  const input = screen.getByRole("combobox", { name: label });
  const options = [...input.querySelectorAll("option")];
  expect(options).toContainEqual(
    expect.objectContaining({ value: optionValue })
  );
  fireEvent.change(input, { target: { value: optionValue } });
};

export const clickRadioButton = (label: string) => {
  const radio = screen.getByRole("radio", { name: label });
  fireEvent.click(radio);
};

export const setCheckbox = (label: string, checked: boolean) => {
  const checkbox = screen.getByRole("checkbox", {
    name: label,
  }) as HTMLInputElement;
  if (checkbox.checked !== checked) {
    fireEvent.click(checkbox);
  }
};

export const clickButton = (label: string) => {
  const button = screen.getByRole("button", { name: label });
  fireEvent.click(button);
};
