import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/ui/collapsible";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/ui/navigation-menu";
import { ScrollArea } from "@/ui/scroll-area";
import { Separator } from "@/ui/separator";
import {
  BookOpen,
  ChevronDown,
  ChevronsUpDown,
  GripVertical,
  LayoutDashboard,
  Settings,
  SearchIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Site } from "@/models/Site";
import { fetchSitePlugin } from "@/services/pluginService";

export function Sidebar({
  sites,
  selectedSite,
  setSelectedSite,
}: {
  sites: Site[];
  selectedSite: Site | null;
  setSelectedSite: React.Dispatch<React.SetStateAction<Site | null>>;
}): JSX.Element {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(244);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const isResizing = useRef(false);
  const [hasPlugins, setHasPlugins] = useState(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing.current && sidebarRef.current) {
      const parentWidth = sidebarRef.current.parentElement?.offsetWidth || 0;
      const newWidth =
        ((e.clientX - sidebarRef.current.offsetLeft) / parentWidth) * 100;
      if (newWidth >= 15 && newWidth <= 30) {
        setSidebarWidth(`${newWidth}%`);
      }
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);
  // TODO: Add a function to fetch pages
  const mainNavItems = [];

  const [searchQuery, setSearchQuery] = useState("");

  const filteredSites = sites.filter((site) =>
    site.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (sites.length > 0) {
      const currentPath = window.location.pathname;
      const pathParts = currentPath.split("/").filter(Boolean);

      if (
        pathParts[0] === "dashboard" &&
        pathParts[1] &&
        !["add-site", "settings"].includes(pathParts[1])
      ) {
        const siteName = pathParts[1];
        const matchingSite = sites.find((site) => site.name === siteName);

        if (
          matchingSite &&
          (!selectedSite || selectedSite.name !== matchingSite.name)
        ) {
          setSelectedSite(matchingSite);
        }
      }
    }
  }, [sites, selectedSite, setSelectedSite]);

  useEffect(() => {
    if (selectedSite) {
      const checkPlugins = async () => {
        try {
          const plugins = await fetchSitePlugin(selectedSite.id);
          setHasPlugins(plugins && plugins.length > 0);
        } catch (error) {
          console.error("Failed to fetch plugins:", error);
          setHasPlugins(false);
        }
      };

      checkPlugins();
    } else {
      setHasPlugins(false);
    }
  }, [selectedSite]);

  return (
    <div
      ref={sidebarRef}
      className="flex flex-col items-start relative self-stretch shadow-sm w-64"
      style={{ width: sidebarWidth }}
    >
      {/* Site selector */}
      <div className="w-full gap-2 p-2 flex flex-col items-start">
        <DropdownMenu onOpenChange={(open) => setIsDropdownOpen(open)}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-12 items-center gap-2 p-2 relative w-full rounded-md justify-between"
            >
              <div className="flex flex-col items-start gap-1 flex-1 w-full text-left">
                <div className="text-sm font-medium text-ellipsis whitespace-nowrap overflow-hidden">
                  {selectedSite ? selectedSite.name : "Select a site"}
                </div>
              </div>
              {isDropdownOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronsUpDown className="w-4 h-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom-start"
            className="w-full max-h-60 overflow-y-auto border border-gray-300 rounded-md shadow-md"
          >
            <div className="flex items-center gap-2 p-2 border-b">
              <SearchIcon className="w-4 h-4" />
              <input
                type="text"
                placeholder="Search sites..."
                className="text-sm text-muted-foreground flex-1 bg-transparent outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {filteredSites.map((site, index) => (
              <DropdownMenuItem
                key={index}
                className="w-full"
                onClick={() => {
                  setSelectedSite(site);
                  navigate(`/dashboard/${site.name}`);
                }}
              >
                {site.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator className="w-full" />
      </div>
      {/* Navigation menu */}
      <ScrollArea className="w-full">
        <NavigationMenu
          orientation="vertical"
          className="!block max-w-none justify-normal w-full p-2 pr-4"
        >
          <NavigationMenuList className="flex flex-col items-start gap-1 w-full">
            {/* Static Overview button */}
            <NavigationMenuItem className="w-full">
              <Button
                variant="ghost"
                className="flex flex-row h-8 items-center gap-2 px-4 py-2 justify-start rounded-md w-full"
                asChild
                disabled={!selectedSite}
              >
                <NavigationMenuLink
                  href={
                    selectedSite
                      ? `/dashboard/${selectedSite.name}`
                      : "/dashboard/"
                  }
                  className="flex items-center gap-2 w-full"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-sm font-normal text-ellipsis whitespace-nowrap overflow-hidden w-full">
                    Overview
                  </span>
                </NavigationMenuLink>
              </Button>
            </NavigationMenuItem>
            {/* Dynamic navigation items */}
            {mainNavItems.map((item, index) => (
              <NavigationMenuItem key={index} className="w-full">
                <Button
                  variant="ghost"
                  className="flex flex-row h-8 items-center gap-2 px-4 py-2 justify-start rounded-md w-full"
                  asChild
                >
                  <NavigationMenuLink
                    className="flex items-center gap-2 w-full"
                    href={item.href}
                  >
                    {item.icon}
                    <span className="text-sm font-normal text-ellipsis whitespace-nowrap overflow-hidden w-full">
                      {item.label}
                    </span>
                  </NavigationMenuLink>
                </Button>
              </NavigationMenuItem>
            ))}

            {/* Settings collapsible section */}
            <NavigationMenuItem className="w-full">
              <Collapsible className="w-full" defaultOpen>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`flex h-8 items-center gap-2 px-4 py-2 justify-start rounded-md w-full`}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-normal flex-1 text-left overflow-hidden text-ellipsis whitespace-nowrap">
                      Settings
                    </span>
                    <ChevronDown className="w-4 h-4 text-zinc-700" />
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="flex flex-col pl-12 pt-1 pb-1 relative w-full">
                  <div className="absolute w-px h-24 top-0 left-4 bg-gray-200" />
                  <Button
                    variant="ghost"
                    className="flex h-7 items-center gap-2 px-4 py-2 justify-start rounded-md w-full"
                    asChild
                    disabled={!selectedSite}
                  >
                    <NavigationMenuLink
                      href={
                        selectedSite
                          ? `/dashboard/${selectedSite.name}/settings/widgets`
                          : "/dashboard/"
                      }
                      className="flex items-start w-full text-sm font-normal flex-1 text-left overflow-hidden text-ellipsis whitespace-nowrap"
                    >
                      Widgets
                    </NavigationMenuLink>
                  </Button>
                  {hasPlugins && (
                    <Button
                      variant="ghost"
                      className="flex h-7 items-center gap-2 px-4 py-2 justify-start rounded-md w-full"
                      asChild
                      disabled={!selectedSite}
                    >
                      <NavigationMenuLink
                        href={
                          selectedSite
                            ? `/dashboard/${selectedSite.name}/settings/plugins`
                            : "/dashboard/"
                        }
                        className="flex items-start w-full text-sm font-normal flex-1 text-left overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        Plugins
                      </NavigationMenuLink>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="flex h-7 items-center gap-2 px-4 py-2 justify-start rounded-md w-full"
                    asChild
                    disabled={!selectedSite}
                  >
                    <NavigationMenuLink
                      href={
                        selectedSite
                          ? `/dashboard/${selectedSite.name}/settings/`
                          : "/dashboard/"
                      }
                      className="flex items-start w-full text-sm font-normal flex-1 text-left overflow-hidden text-ellipsis whitespace-nowrap"
                    >
                      Settings
                    </NavigationMenuLink>
                  </Button>
                </CollapsibleContent>
              </Collapsible>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </ScrollArea>
      {/* Resize handle */}
      <div
        className="absolute w-4 h-full top-0 right-0 z-10 cursor-ew-resize"
        onMouseDown={(e) => {
          e.preventDefault();
          isResizing.current = true;
        }}
      >
        <GripVertical className="fixed h-full w-4 opacity-50 hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
