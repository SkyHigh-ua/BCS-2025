import React from "react";
import { render, screen, act } from "@testing-library/react";
import Teams from "@/components/Dashboard/Settings/Teams";
import * as userService from "@/services/userService";
import * as rbacService from "@/services/rbacService";
import { User } from "@/models/User";
import { Site } from "@/models/Site";

// Override existing mocks with complete mocks
jest.mock("@/services/userService", () => ({
  fetchUsers: jest.fn(),
}));

jest.mock("@/services/rbacService", () => ({
  getUserOwnedGroups: jest.fn(),
  getGroupUsers: jest.fn(),
  getSitesForGroup: jest.fn(),
  createGroup: jest.fn(),
  assignGroupToSite: jest.fn(),
  assignGroupToUser: jest.fn(),
}));

// Mock UI components
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }) => (
    <div data-testid="main-card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }) => <div data-testid="card-title">{children}</div>,
  CardDescription: ({ children }) => (
    <div data-testid="card-description">{children}</div>
  ),
  CardContent: ({ children }) => (
    <div data-testid="card-content">{children}</div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant, size, className }) => (
    <button data-testid="button" className={className} onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }) => (
    <div data-testid="select">{children}</div>
  ),
  SelectTrigger: ({ children, className }) => (
    <div data-testid="select-trigger" className={className}>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }) => (
    <div data-testid="select-value">{placeholder}</div>
  ),
  SelectContent: ({ children, align }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ children, value }) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
  ),
}));

describe("Teams Component", () => {
  const mockUser: User = {
    id: "user1",
    name: "Test User",
    email: "test@example.com",
  };

  const mockSites: Site[] = [
    {
      id: "site1",
      name: "Site 1",
      domain: "site1.com",
      description: "Site 1 Description",
    },
    {
      id: "site2",
      name: "Site 2",
      domain: "site2.com",
      description: "Site 2 Description",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up mock implementations
    (userService.fetchUsers as jest.Mock).mockResolvedValue([
      { id: "user2", name: "User 2", email: "user2@example.com" },
    ]);

    (rbacService.getUserOwnedGroups as jest.Mock).mockResolvedValue([
      { id: "team1", name: "Team 1", description: "Team 1 Description" },
    ]);

    (rbacService.getGroupUsers as jest.Mock).mockResolvedValue([]);
    (rbacService.getSitesForGroup as jest.Mock).mockResolvedValue([]);
  });

  test("renders company title", async () => {
    await act(async () => {
      render(<Teams user={mockUser} sites={mockSites} />);
    });

    // Check for a specific element that should be rendered
    expect(screen.getByText("Company")).toBeInTheDocument();
  });
});
