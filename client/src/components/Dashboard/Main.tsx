import React from "react";
import { useEffect } from "react";
import { Routes, Route, useParams, Navigate } from "react-router-dom";
import General from "./Site/Settings/General";
import Plugins from "./Site/Settings/Plugins";
import Widgets from "./Site/Settings/Widgets";
import { Main as SitePage } from "./Site/Main";
import AddSite from "./Site/AddSite";
import Widget from "@/components/Widget/Widget";
import NotFound from "@/pages/NotFound";
import SettingsMain from "@/components/Dashboard/Settings/Main";
import { Site } from "@/models/Site";
import { User } from "@/models/User";

export function Main({
  user,
  setUser,
  sites,
  setSites,
  setSelectedSite,
}: {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  sites: Site[];
  setSites: React.Dispatch<React.SetStateAction<Site[]>>;
  setSelectedSite: React.Dispatch<React.SetStateAction<Site | null>>;
}): JSX.Element {
  const { siteName } = useParams();

  useEffect(() => {
    if (siteName && sites.length > 0) {
      const matchingSite = sites.find((s) => s.name === siteName);
      if (matchingSite) {
        setSelectedSite(matchingSite);
      }
    } else if (
      !siteName &&
      sites.length > 0 &&
      !window.location.pathname.includes("/settings") &&
      !window.location.pathname.includes("/add-site")
    ) {
      setSelectedSite(null);
    }
  }, [siteName, sites, setSelectedSite]);

  return (
    <section className="flex flex-col p-6 flex-1 bg-primary-foreground border border-sidebar-border">
      <Routes>
        <Route
          path="/settings/*"
          element={<SettingsMain user={user} setUser={setUser} sites={sites} />}
        />
        <Route path="/add-site" element={<AddSite />} />
        <Route
          path="/:siteName"
          element={<SiteRoutes sites={sites} setSites={setSites} />}
        />
        <Route
          path="/:siteName/*"
          element={<SiteRoutes sites={sites} setSites={setSites} />}
        />
      </Routes>
    </section>
  );
}

function SiteRoutes({
  sites,
  setSites,
}: {
  sites: Site[];
  setSites: React.Dispatch<React.SetStateAction<Site[]>>;
}): JSX.Element {
  const { siteName, "*": splat } = useParams();
  const site = siteName ? sites.find((s) => s.name === siteName) : null;
  if (!site) {
    return <NotFound className="!h-full" />;
  }
  if (splat === "settings/") {
    return <General site={site} setSites={setSites} />;
  }
  if (splat === "settings/widgets") {
    return <Widgets site={site} />;
  }
  if (splat === "settings/plugins") {
    return <Plugins site={site} />;
  }
  if (!splat || splat === "") {
    return <SitePage siteId={site.id} />;
  }
  const widgetPattern = /^([^/]+)$/;
  const widgetMatch = splat.match(widgetPattern);
  if (widgetMatch) {
    return <Widget id={widgetMatch[1]} />;
  }
  return <NotFound className="!h-full" />;
}
