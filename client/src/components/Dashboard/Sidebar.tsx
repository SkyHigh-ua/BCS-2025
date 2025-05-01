import React, { useState, useRef, useEffect } from "react";
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
import { Input } from "@/ui/input";

export function Sidebar(): JSX.Element {
  const [selectedSite, setSelectedSite] = useState("sitetest1.com");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(244);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const isResizing = useRef(false);

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
  // Navigation items data
  const mainNavItems = [
    { icon: <BookOpen className="w-4 h-4" />, label: "Performance" },
    { icon: <BookOpen className="w-4 h-4" />, label: "Security" },
    { icon: <BookOpen className="w-4 h-4" />, label: "Analytics" },
    { icon: <BookOpen className="w-4 h-4" />, label: "SEO" },
    { icon: <BookOpen className="w-4 h-4" />, label: "Web Analytics" },
    { icon: <BookOpen className="w-4 h-4" />, label: "Reports" },
  ];

  const sites = ["sitetest1.com", "sitetest2.com", "sitetest3.com"];
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSites = sites.filter((site) =>
    site.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  {selectedSite}
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
                onClick={() => setSelectedSite(site)}
              >
                {site}
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
              >
                <NavigationMenuLink
                  href={`/dashboard/${selectedSite}`}
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
                  <NavigationMenuLink className="flex items-center gap-2 w-full">
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
                  >
                    <NavigationMenuLink
                      href={`/dashboard/${selectedSite}/settings/widgets`}
                      className="flex items-start w-full text-sm font-normal flex-1 text-left overflow-hidden text-ellipsis whitespace-nowrap"
                    >
                      Widgets
                    </NavigationMenuLink>
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex h-7 items-center gap-2 px-4 py-2 justify-start rounded-md w-full"
                    asChild
                  >
                    <NavigationMenuLink
                      href={`/dashboard/${selectedSite}/settings/plugins`}
                      className="flex items-start w-full text-sm font-normal flex-1 text-left overflow-hidden text-ellipsis whitespace-nowrap"
                    >
                      Plugins
                    </NavigationMenuLink>
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex h-7 items-center gap-2 px-4 py-2 justify-start rounded-md w-full"
                    asChild
                  >
                    <NavigationMenuLink
                      href={`/dashboard/${selectedSite}/settings/`}
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
