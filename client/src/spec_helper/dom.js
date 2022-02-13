import { fireEvent, screen } from "@testing-library/react";

export const enterTextValue = (label, value) => {
  const input = screen.getByRole("textbox", { name: label });
  fireEvent.change(input, { target: { value } });
};

export const clickRadioButton = (label) => {
  const radio = screen.getByRole("radio", { name: label });
  fireEvent.click(radio);
};

export const clickButton = (label) => {
  const button = screen.getByRole("button", { name: label });
  fireEvent.click(button);
};
