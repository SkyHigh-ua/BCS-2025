import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Index from "../../../components/Auth/Index";

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock UI components
jest.mock("@/ui/button", () => ({
  Button: ({ children, onClick }) => (
    <button data-testid="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock("@/ui/card", () => ({
  Card: ({ children, className }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }) => (
    <div data-testid="card-title" className={className}>
      {children}
    </div>
  ),
  CardDescription: ({ children, className }) => (
    <div data-testid="card-description" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

jest.mock("@/ui/separator", () => ({
  Separator: ({ className }) => (
    <div data-testid="separator" className={className}></div>
  ),
}));

describe("Auth Index Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders title and description", () => {
    render(<Index />);

    expect(screen.getByText("Site Monitor")).toBeInTheDocument();
    expect(screen.getByText("Your site is monitored 24/7")).toBeInTheDocument();
  });

  test("Start button navigates to signup page", () => {
    render(<Index />);

    const startButton = screen.getByText("Start");
    fireEvent.click(startButton);

    expect(mockNavigate).toHaveBeenCalledWith("/signup");
  });

  test("Log In button navigates to login page", () => {
    render(<Index />);

    const loginButton = screen.getByText("Log In");
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
