import React from "react";
import { render, screen } from "@testing-library/react";
import { Main } from "../../../components/Dashboard/Main";
import { User } from "../../../models/User";
import { Site } from "../../../models/Site";

// Mock all components that would be used via Routes
jest.mock("../../../components/Dashboard/Settings/Main", () => ({
  __esModule: true,
  default: () => <div data-testid="settings-main">Settings Main</div>,
}));

jest.mock("../../../components/Dashboard/Site/AddSite", () => ({
  __esModule: true,
  default: () => <div data-testid="add-site">Add Site</div>,
}));

jest.mock("../../../components/Dashboard/Site/Main", () => ({
  __esModule: true,
  Main: ({ siteId }) => (
    <div data-testid="site-page">Site Page for {siteId}</div>
  ),
}));

jest.mock("../../../components/Dashboard/Site/Settings/General", () => ({
  __esModule: true,
  default: ({ site }) => (
    <div data-testid="general-settings">General Settings for {site.name}</div>
  ),
}));

jest.mock("../../../components/Dashboard/Site/Settings/Widgets", () => ({
  __esModule: true,
  default: ({ site }) => (
    <div data-testid="widgets-settings">Widgets Settings for {site.name}</div>
  ),
}));

jest.mock("../../../components/Dashboard/Site/Settings/Plugins", () => ({
  __esModule: true,
  default: ({ site }) => (
    <div data-testid="plugins-settings">Plugins Settings for {site.name}</div>
  ),
}));

jest.mock("@/pages/NotFound", () => ({
  __esModule: true,
  default: ({ className }) => (
    <div data-testid="not-found" className={className}>
      Not Found
    </div>
  ),
}));

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: ({ path, element }) => (
    <div data-testid={`route-${path}`}>{element}</div>
  ),
  useParams: () => ({ siteName: "example-site" }),
  MemoryRouter: ({ children }) => <div>{children}</div>,
}));

// Mock data
const mockUser: User = {
  id: "user1",
  name: "Test User",
  email: "test@example.com",
};

const mockSites: Site[] = [
  {
    id: "site1",
    name: "example-site",
    domain: "example.com",
    description: "Example Site",
  },
  {
    id: "site2",
    name: "test-site",
    domain: "test.com",
    description: "Test Site",
  },
];

const mockSetUser = jest.fn();
const mockSetSites = jest.fn();
const mockSetSelectedSite = jest.fn();

describe("Dashboard Main Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders dashboard component", () => {
    render(
      <div>
        <Main
          user={mockUser}
          setUser={mockSetUser}
          sites={mockSites}
          setSites={mockSetSites}
          setSelectedSite={mockSetSelectedSite}
        />
      </div>
    );

    expect(screen.getByTestId("routes")).toBeInTheDocument();
  });
});
