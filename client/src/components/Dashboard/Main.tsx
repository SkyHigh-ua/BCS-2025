import React from "react";
import { Routes, Route } from "react-router-dom";
import { SiteInfoWidget, DomainInfoWidget, UptimeWidget } from "./Widgets";
import General from "./Site/Settings/General";
import Plugins from "./Site/Settings/Plugins";
import Widgets from "./Site/Settings/Widgets";
import { Main as SitePage } from "./Site/Main";
import AddSite from "./Site/AddSite";
import Widget from "@/components/Widget/Widget";
import NotFound from "@/pages/NotFound";
import SettingsMain from "@/components/Dashboard/Settings/Main";

export function Main(): JSX.Element {
  return (
    <section className="flex flex-col p-6 flex-1 bg-primary-foreground border border-sidebar-border">
      <Routes>
        <Route path="/site-info" element={<SiteInfoWidget />} />
        <Route path="/domain-info" element={<DomainInfoWidget />} />
        <Route path="/uptime" element={<UptimeWidget />} />
        <Route path="/settings/*" element={<SettingsMain />} />
        <Route path="/add-site" element={<AddSite />} />
        <Route path="/:siteName" element={<SitePage />} />
        <Route path="/:siteName/settings/" element={<General />} />
        <Route path="/:siteName/settings/widgets" element={<Widgets />} />
        <Route path="/:siteName/settings/plugins" element={<Plugins />} />
        <Route path="/:siteName/:widgetName" element={<Widget />} />
        <Route path="*" element={<NotFound className="!h-full" />} />
      </Routes>
    </section>
  );
}
