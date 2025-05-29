import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Signup from "../../../components/Auth/Signup";
import * as authService from "../../../services/authService";
import * as siteService from "../../../services/siteService";
import * as moduleService from "../../../services/moduleService";
import * as pluginService from "../../../services/pluginService";

// Override existing mocks with complete mocks
jest.mock("../../../services/authService", () => ({
  signup: jest.fn(),
}));

jest.mock("../../../services/siteService", () => ({
  createSite: jest.fn(),
}));

jest.mock("../../../services/moduleService", () => ({
  assignModules: jest.fn(),
}));

jest.mock("../../../services/pluginService", () => ({
  assignPluginToSite: jest.fn(),
}));

jest.mock("../../../components/ui/progress-bar", () => () => (
  <div data-testid="progress-bar">Progress Bar</div>
));

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock form components
jest.mock("../../../components/Auth/Stages/RegistrationForm", () => ({
  __esModule: true,
  default: ({ onNext, onUpdate, initialData }) => (
    <div data-testid="registration-form">
      <input
        data-testid="email-input"
        value={initialData.email}
        onChange={(e) => onUpdate({ ...initialData, email: e.target.value })}
      />
      <input
        data-testid="password-input"
        type="password"
        value={initialData.password}
        onChange={(e) => onUpdate({ ...initialData, password: e.target.value })}
      />
      <button data-testid="next-button" onClick={onNext}>
        Next
      </button>
    </div>
  ),
}));

jest.mock("../../../components/Auth/Stages/PersonalInfoForm", () => ({
  __esModule: true,
  default: ({ onNext, onBack, onUpdate, initialData }) => (
    <div data-testid="personal-info-form">
      <input
        data-testid="firstname-input"
        value={initialData.firstName}
        onChange={(e) =>
          onUpdate({ ...initialData, firstName: e.target.value })
        }
      />
      <input
        data-testid="lastname-input"
        value={initialData.lastName}
        onChange={(e) => onUpdate({ ...initialData, lastName: e.target.value })}
      />
      <button data-testid="back-button" onClick={onBack}>
        Back
      </button>
      <button data-testid="next-button" onClick={onNext}>
        Next
      </button>
    </div>
  ),
}));

jest.mock("../../../components/Auth/Stages/AddSiteForm", () => ({
  __esModule: true,
  default: ({ onNext, onBack, onUpdate, initialData }) => (
    <div data-testid="add-site-form">
      <input
        data-testid="site-name-input"
        value={initialData.name}
        onChange={(e) => onUpdate({ ...initialData, name: e.target.value })}
      />
      <input
        data-testid="domain-input"
        value={initialData.domain}
        onChange={(e) => onUpdate({ ...initialData, domain: e.target.value })}
      />
      <button data-testid="back-button" onClick={onBack}>
        Back
      </button>
      <button data-testid="next-button" onClick={onNext}>
        Next
      </button>
    </div>
  ),
}));

jest.mock("../../../components/Auth/Stages/ChooseModulesForm", () => ({
  __esModule: true,
  default: ({ onComplete, initialData }) => (
    <div data-testid="choose-modules-form">
      <select
        data-testid="modules-select"
        multiple
        value={initialData}
        onChange={(e) => {
          const values = Array.from(
            e.target.selectedOptions,
            (option) => option.value
          );
          // This sets the modules array
        }}
      >
        <option value="module1">Module 1</option>
        <option value="module2">Module 2</option>
      </select>
      <button
        data-testid="complete-button"
        onClick={() => onComplete(["module1"])}
      >
        Complete
      </button>
    </div>
  ),
}));

describe("Signup Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    // Mock API responses
    (authService.signup as jest.Mock).mockResolvedValue({
      login_token: "mock-jwt-token",
      user: { id: "user1", name: "Test User", email: "test@example.com" },
    });

    (siteService.createSite as jest.Mock).mockResolvedValue({
      id: "site1",
      name: "Test Site",
      domain: "test.com",
    });

    (moduleService.assignModules as jest.Mock).mockResolvedValue({
      success: true,
    });

    (pluginService.assignPluginToSite as jest.Mock).mockResolvedValue({
      success: true,
    });
  });

  test("renders the registration form initially", () => {
    render(<Signup />);

    expect(screen.getByTestId("registration-form")).toBeInTheDocument();
    expect(screen.getByTestId("progress-bar")).toBeInTheDocument();
  });

  test("navigates through form stages", async () => {
    render(<Signup />);

    // Stage 1: Registration
    expect(screen.getByTestId("registration-form")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("next-button"));

    // Stage 2: Personal Info
    await waitFor(() => {
      expect(screen.getByTestId("personal-info-form")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("next-button"));

    // Stage 3: Add Site
    await waitFor(() => {
      expect(screen.getByTestId("add-site-form")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("next-button"));

    // Check API calls
    await waitFor(() => {
      expect(authService.signup).toHaveBeenCalled();
      expect(siteService.createSite).toHaveBeenCalled();
    });
  });
});
