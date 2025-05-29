import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Login from "../../../components/Auth/Login";
import * as authService from "../../../services/authService";

// Mock the auth service
jest.mock("../../../services/authService", () => ({
  login: jest.fn(),
}));

// Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders login form correctly", () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    expect(screen.getByText(/Log in to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Log In/i })).toBeInTheDocument();
  });

  test("handles form submission with valid credentials", async () => {
    // Mock successful login
    (authService.login as jest.Mock).mockResolvedValue({
      login_token: "test-token",
    });

    render(
      <Router>
        <Login />
      </Router>
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Log In/i }));

    // Wait for the login process
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(localStorage.getItem("jwt")).toBe("test-token");
      expect(mockedNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("shows error message with invalid credentials", async () => {
    // Mock failed login
    (authService.login as jest.Mock).mockRejectedValue(
      new Error("Invalid credentials")
    );

    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Log In/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Invalid email or password/i)
      ).toBeInTheDocument();
      expect(authService.login).toHaveBeenCalledWith(
        "wrong@example.com",
        "wrongpass"
      );
      expect(localStorage.getItem("jwt")).toBeFalsy();
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
  });

  test("validates form fields before submission", async () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    // Submit without filling fields
    fireEvent.click(screen.getByRole("button", { name: /Log In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
      expect(authService.login).not.toHaveBeenCalled();
    });
  });
});
