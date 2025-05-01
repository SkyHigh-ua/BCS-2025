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
import { Site } from "@/models/Site";
import { User } from "@/models/User";

export function Main({
  user,
  setUser,
  sites,
}: {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  sites: Site[];
}): JSX.Element {
  const { siteName } = useParams();

  const site = siteName ? sites.find((s) => s.name === siteName) : null;
  const isValidSite = !!site;

  return (
    <section className="flex flex-col p-6 flex-1 bg-primary-foreground border border-sidebar-border">
      <Routes>
        <Route
          path="/settings/*"
          element={<SettingsMain user={user} setUser={setUser} sites={sites} />}
        />
        <Route path="/add-site" element={<AddSite />} />
        {isValidSite ? (
          <>
            <Route path="/:siteName" element={<SitePage />} />
            <Route
              path="/:siteName/settings/"
              element={<General site={site} />}
            />
            <Route
              path="/:siteName/settings/widgets"
              element={<Widgets site={site} />}
            />
            <Route
              path="/:siteName/settings/plugins"
              element={<Plugins site={site} />}
            />
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
