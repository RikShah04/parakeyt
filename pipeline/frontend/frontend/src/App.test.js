import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ParaKeyt title', () => {
  render(<App />);
  const titleElement = screen.getByText(/ParaKeyt/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders keyboard parameters section', () => {
  render(<App />);
  const parametersElement = screen.getByText(/Keyboard Parameters/i);
  expect(parametersElement).toBeInTheDocument();
});

test('renders generate configuration button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/Generate Configuration/i);
  expect(buttonElement).toBeInTheDocument();
});
