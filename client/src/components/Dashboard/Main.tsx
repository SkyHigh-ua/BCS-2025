import React from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import General from "./Site/Settings/General";
import Plugins from "./Site/Settings/Plugins";
import Widgets from "./Site/Settings/Widgets";
import { Main as SitePage } from "./Site/Main";
import AddSite from "./Site/AddSite";
import Widget from "@/components/Widget/Widget";
import NotFound from "@/pages/NotFound";
import SettingsMain from "@/components/Dashboard/Settings/Main";

export function Main({ sites }: { sites: string[] }): JSX.Element {
  const { siteName } = useParams();

  // Check if the siteName is valid
  const isValidSite = siteName ? sites.includes(siteName) : true;

  return (
    <section className="flex flex-col p-6 flex-1 bg-primary-foreground border border-sidebar-border">
      <Routes>
        <Route path="/settings/*" element={<SettingsMain />} />
        <Route path="/add-site" element={<AddSite />} />
        {isValidSite ? (
          <>
            <Route path="/:siteName" element={<SitePage />} />
            <Route path="/:siteName/settings/" element={<General />} />
            <Route path="/:siteName/settings/widgets" element={<Widgets />} />
            <Route path="/:siteName/settings/plugins" element={<Plugins />} />
            <Route path="/:siteName/:widgetName" element={<Widget />} />
          </>
        ) : (
          <Route path="*" element={<NotFound className="!h-full" />} />
        )}
        <Route path="*" element={<NotFound className="!h-full" />} />
      </Routes>
    </section>
  );
}
