import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import Widget from "@/components/Widget/Widget";
import * as moduleService from "@/services/moduleService";

// Override the existing mock with a complete mock
jest.mock("@/services/moduleService", () => ({
  getWidgetComponent: jest.fn(),
}));

jest.mock("string-to-react-component", () => ({
  __esModule: true,
  default: ({ data, children }) => (
    <div data-testid="string-to-react-component">
      {children}
      <div data-testid="component-data">{JSON.stringify(data)}</div>
    </div>
  ),
}));

describe("Widget Component", () => {
  const mockWidgetId = "widget1";
  const mockSiteId = "site1";
  const mockModule = {
    id: "module1",
    name: "Test Module",
    description: "Test Description",
  };
  const mockComponentCode = "<div>Test Component</div>";
  const mockInputs = { value: "test" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows loading state initially", async () => {
    // Mock delay with a promise that doesn't resolve immediately
    (moduleService.getWidgetComponent as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({}), 500))
    );

    await act(async () => {
      render(<Widget widgetId={mockWidgetId} siteId={mockSiteId} />);
    });

    expect(screen.getByText("Loading widget...")).toBeInTheDocument();
  });

  test("renders widget component when data is loaded", async () => {
    (moduleService.getWidgetComponent as jest.Mock).mockResolvedValue({
      module: mockModule,
      component: mockComponentCode,
      inputs: mockInputs,
    });

    await act(async () => {
      render(<Widget widgetId={mockWidgetId} siteId={mockSiteId} />);
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("string-to-react-component")
      ).toBeInTheDocument();
    });

    expect(moduleService.getWidgetComponent).toHaveBeenCalledWith(
      mockWidgetId,
      mockSiteId
    );
  });

  test("displays error message when widget fails to load", async () => {
    console.error = jest.fn(); // Suppress console.error
    (moduleService.getWidgetComponent as jest.Mock).mockRejectedValue(
      new Error("Failed to fetch widget")
    );

    await act(async () => {
      render(<Widget widgetId={mockWidgetId} siteId={mockSiteId} />);
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Error: Failed to fetch widget/i)
      ).toBeInTheDocument();
    });
  });

  test("displays fallback when no component code is available", async () => {
    (moduleService.getWidgetComponent as jest.Mock).mockResolvedValue({
      module: mockModule,
      component: null,
      inputs: mockInputs,
    });

    await act(async () => {
      render(<Widget widgetId={mockWidgetId} siteId={mockSiteId} />);
    });

    await waitFor(() => {
      expect(
        screen.getByText("No widget component available")
      ).toBeInTheDocument();
    });
  });
});
