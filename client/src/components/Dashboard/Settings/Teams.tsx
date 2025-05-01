import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  CircleIcon,
  MoreHorizontalIcon,
  SearchIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";

export default function Teams(): JSX.Element {
  // Teams data
  const teams = [
    { name: "Administration", icon: "team" },
    { name: "DevOps", icon: "team" },
    { name: "SEO Specialists", icon: "team" },
    { name: "Accountant", icon: "team" },
    { name: "Web developer", icon: "team" },
    { name: "Web analytics", icon: "team" },
  ];

  // Members data
  const members = [
    {
      name: "Anthony",
      email: "m@example.com",
      role: "Owner",
      isEditable: false,
    },
    {
      name: "Jackson Lee",
      email: "p@example.com",
      role: "Manager",
      isEditable: true,
    },
    {
      name: "Jackson Lee",
      email: "p@example.com",
      role: "Manager",
      isEditable: true,
    },
  ];

  // Sites data
  const sites = [
    { name: "sitetest.com", checked: false },
    { name: "sitetest2.com", checked: true },
    { name: "site-test.com", checked: false },
    { name: "site-test4.com", checked: false },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [siteStates, setSiteStates] = useState(
    sites.map((site) => ({ ...site }))
  );

  const filteredSites = siteStates.filter((site) =>
    site.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCheckbox = (index: number) => {
    setSiteStates((prev) =>
      prev.map((site, i) =>
        i === index ? { ...site, checked: !site.checked } : site
      )
    );
  };

  return (
    <Card className="flex flex-col gap-6 w-full overflow-hidden border-none shadow-none">
      <CardHeader>
        <CardTitle>Company</CardTitle>
        <CardDescription>
          This is your organization's main workspace. Manage company-wide
          settings <br />
          and overall access.
        </CardDescription>
      </CardHeader>

      <Separator className="w-full" />

      {/* Teams card */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <CardTitle>Teams</CardTitle>
            <CardDescription>
              Teams help organize members around specific websites or projects.
              Each team can have its own members and site access.
            </CardDescription>
          </div>
          <Button>Add new team</Button>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="flex flex-col gap-4">
            {teams.map((team, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-9 h-9 bg-slate-300 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4" />
                  </div>
                  <div className="font-medium text-foreground">{team.name}</div>
                </div>

                {index === 0 ? (
                  <div className="w-[179px] opacity-50">
                    <div className="flex items-center gap-3 px-3 py-2 bg-background rounded-md border-border">
                      <div className="flex-1 text-sm text-foreground">
                        All Sites
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-[177px] h-[38px] gap-2"
                        >
                          <CircleIcon className="w-4 h-4" />
                          <span>Set Access Sites</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[254px] p-0" align="end">
                        <div className="flex items-center gap-2 p-2 border-b">
                          <SearchIcon className="w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Find site"
                            className="text-sm text-muted-foreground flex-1 bg-transparent outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="p-2">
                          {filteredSites.map((site, siteIndex) => (
                            <div
                              key={siteIndex}
                              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                            >
                              <Checkbox
                                id={`site-${siteIndex}`}
                                checked={site.checked}
                                onCheckedChange={() =>
                                  toggleCheckbox(siteIndex)
                                }
                              />
                              <label
                                htmlFor={`site-${siteIndex}`}
                                className="text-sm flex-1 cursor-pointer"
                              >
                                {site.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button variant="ghost" size="icon" className="w-12 h-9">
                      <Trash2Icon className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Members card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Members are users with access to specific teams. Assign roles to
            control their level of access and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="flex flex-col gap-4">
            {members.map((member, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <div className="font-medium text-foreground">
                      {member.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.email}
                    </div>
                  </div>
                </div>

                {!member.isEditable ? (
                  <div className="w-[131px] opacity-50">
                    <div className="flex items-center gap-3 px-3 py-2 bg-background rounded-md border-border">
                      <div className="flex-1 text-sm text-foreground">
                        {member.role}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Select defaultValue={member.role}>
                      <SelectTrigger className="w-[139px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Owner">Owner</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-12 h-9"
                        >
                          <MoreHorizontalIcon className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invite user card */}
      <Card id="invite-card" className="w-full">
        <CardHeader>
          <CardTitle>Invite a New User</CardTitle>
          <CardDescription>
            Invite members to collaborate on managing and monitoring your
            websites.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="flex flex-col gap-4">
            {/* Email field */}
            <div className="flex flex-col gap-1.5">
              <label className="font-medium text-sm text-slate-900">
                Email
              </label>
              <Input defaultValue="test@test.com" placeholder="Email address" />
            </div>

            {/* Assign Team field */}
            <div className="flex flex-col gap-1.5">
              <label className="font-medium text-sm text-slate-900">
                Assign Team
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team, index) => (
                    <SelectItem
                      key={index}
                      value={team.name.toLowerCase().replace(/\s+/g, "-")}
                    >
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assign Role field */}
            <div className="flex flex-col gap-1.5">
              <label className="font-medium text-sm text-slate-900">
                Assign Role
              </label>
              <Select defaultValue="viewer">
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-500">
                Choose the appropriate role for the user. Roles define the
                user's permissions within your profile: manager - can add and
                remove websites, viewer – can only view website information,
                without editing rights.
              </p>
            </div>

            {/* Message field */}
            <div className="flex flex-col gap-1.5">
              <label className="font-medium text-sm text-slate-900">
                Message (optional)
              </label>
              <Textarea
                placeholder="Type your message here"
                className="h-20 resize-none"
              />
              <Button>Send Invitation</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Card>
  );
}
