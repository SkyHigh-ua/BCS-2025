import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import Profile from "./Profile";
import Teams from "./Teams";
import { Button } from "../../ui/button";
import { Site } from "@/models/Site";
import { User } from "@/models/User";

export default function SettingsMain({
  user,
  setUser,
  sites,
}: {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  sites: Site[];
}): JSX.Element {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col w-full overflow-hidden">
      <CardContent className="flex flex-col gap-6 p-8">
        <header className="flex flex-col items-start gap-6 px-4 w-full">
          <div className="flex flex-col items-start gap-1.5 w-full">
            <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account settings and set e-mail preferences.
            </p>
          </div>
          <Separator className="w-full" />
        </header>
        <div className="flex items-start gap-8 pb-6">
          {/* Sidebar navigation */}
          <nav className="flex flex-col w-64 items-start gap-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/dashboard/settings/profile")}
            >
              Profile
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/dashboard/settings/teams")}
            >
              Teams
            </Button>
          </nav>
          <Routes>
            <Route
              path="/profile"
              element={<Profile user={user} setUser={setUser} />}
            />
            <Route
              path="/teams"
              element={<Teams user={user} sites={sites} />}
            />
          </Routes>
        </div>
      </CardContent>
    </Card>
  );
}
