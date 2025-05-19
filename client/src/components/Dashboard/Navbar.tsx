import React from "react";
import { Avatar, AvatarFallback } from "@/ui/avatar";
import { Button } from "@/ui/button";
import {
  BellIcon,
  ChevronDownIcon,
  HelpCircleIcon,
  UserIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { User } from "@/models/User";

export const Navbar = ({ user }: { user: User | null }): JSX.Element => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    navigate("/");
  };

  return (
    <header className="flex h-[60px] items-center justify-between w-full border-b bg-background px-6 py-4">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold tracking-tight">Site Monitor</h1>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-md"
            onClick={() => navigate("/dashboard/notifications")}
          >
            <BellIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="h-[38px] px-6"
            onClick={() => {
              navigate("/dashboard/settings/teams");
              setTimeout(() => {
                const inviteCard = document.getElementById("invite-card");
                if (inviteCard) {
                  const offset = -50;
                  const topPosition =
                    inviteCard.getBoundingClientRect().top +
                    window.scrollY +
                    offset;
                  window.scrollTo({ top: topPosition, behavior: "smooth" });
                }
              }, 100);
            }}
          >
            <span className="text-sm font-medium">Invite coworkers</span>
          </Button>

          <Button
            className="h-9 px-6"
            onClick={() => navigate("/dashboard/add-site")}
          >
            <span className="text-sm font-medium">Add site to monitoring</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 cursor-pointer"
              >
                <Avatar className="h-9 w-9">
                  {user?.pfp ? (
                    <img
                      src={user.pfp}
                      alt="User Avatar"
                      className="h-full w-full rounded-full"
                    />
                  ) : (
                    <AvatarFallback className="bg-secondary">
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">
                    {user && user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : "Loading..."}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 text-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => navigate("/dashboard/settings/profile")}
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
