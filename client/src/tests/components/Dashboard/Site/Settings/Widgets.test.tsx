import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import Widgets from "@/components/Dashboard/Site/Settings/Widgets";
import * as moduleService from "@/services/moduleService";
import { Site } from "@/models/Site";

// Override the existing mock with a complete mock
jest.mock("@/services/moduleService", () => ({
  fetchAllModules: jest.fn(),
  getModulesBySiteId: jest.fn(),
  toggleModuleForSite: jest.fn(),
}));

describe("Widgets Settings Component", () => {
  const mockSite: Site = {
    id: "site1",
    name: "Test Site",
    domain: "test.com",
    description: "Test Description",
  };

  const mockModules = [
    {
      id: "module1",
      name: "Module 1",
      description: "Description 1",
      tags: ["tag1", "tag2"],
    },
    {
      id: "module2",
      name: "Module 2",
      description: "Description 2",
      tags: ["tag2", "tag3"],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up mock implementations for each test
    (moduleService.fetchAllModules as jest.Mock).mockResolvedValue(mockModules);
    (moduleService.getModulesBySiteId as jest.Mock).mockResolvedValue([]);
    (moduleService.toggleModuleForSite as jest.Mock).mockResolvedValue({
      success: true,
    });
  });

  test("renders marketplace title and description", async () => {
    await act(async () => {
      render(<Widgets site={mockSite} />);
    });

    expect(screen.getByText("Marketplace")).toBeInTheDocument();
    expect(
      screen.getByText(/Discover add-ons to extend monitoring capabilities/)
    ).toBeInTheDocument();
  });

  test("fetches and displays modules", async () => {
    await act(async () => {
      render(<Widgets site={mockSite} />);
    });

    await waitFor(() => {
      expect(moduleService.fetchAllModules).toHaveBeenCalled();
      expect(moduleService.getModulesBySiteId).toHaveBeenCalledWith("site1");
    });

    expect(screen.getByText("Module 1")).toBeInTheDocument();
    expect(screen.getByText("Module 2")).toBeInTheDocument();
    expect(screen.getByText("Description 1")).toBeInTheDocument();
    expect(screen.getByText("Description 2")).toBeInTheDocument();
    expect(screen.getByText("tag1")).toBeInTheDocument();
  });

  test("toggles module when switch is clicked", async () => {
    await act(async () => {
      render(<Widgets site={mockSite} />);
    });

    await waitFor(() => {
      expect(screen.getByText("Module 1")).toBeInTheDocument();
    });

    await act(async () => {
      const switches = await screen.findAllByRole("switch");
      fireEvent.click(switches[0]);
    });

    await waitFor(() => {
      expect(moduleService.toggleModuleForSite).toHaveBeenCalledWith(
        "site1",
        "module1",
        true
      );
    });
  });

  test("handles error when toggling module", async () => {
    console.error = jest.fn(); // Suppress console.error
    (moduleService.toggleModuleForSite as jest.Mock).mockRejectedValue(
      new Error("Failed to toggle")
    );

    await act(async () => {
      render(<Widgets site={mockSite} />);
    });

    await waitFor(() => {
      expect(screen.getByText("Module 1")).toBeInTheDocument();
    });

    await act(async () => {
      const switches = await screen.findAllByRole("switch");
      fireEvent.click(switches[0]);
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error toggling module:",
        expect.any(Error)
      );
    });
  });

  test("shows modules as enabled if they are in site modules", async () => {
    (moduleService.getModulesBySiteId as jest.Mock).mockResolvedValue([
      mockModules[0],
    ]);

    await act(async () => {
      render(<Widgets site={mockSite} />);
    });

    await waitFor(() => {
      const switches = screen.getAllByRole("switch");
      expect(switches[0]).toBeChecked();
      expect(switches[1]).not.toBeChecked();
    });
  });
});
