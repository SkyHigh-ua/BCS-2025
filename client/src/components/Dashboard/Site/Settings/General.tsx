import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";
import { Separator } from "@/ui/separator";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Switch } from "@/ui/switch";
import { Site } from "@/models/Site";
import { updateSite, deleteSite } from "@/services/siteService";

export default function General({
  site,
  setSites,
}: {
  site: Site;
  setSites: React.Dispatch<React.SetStateAction<Site[]>>;
}): JSX.Element {
  const navigate = useNavigate();
  const { sitename } = useParams();
  const [siteName, setSiteName] = useState(site.name);
  const [siteDomain, setSiteDomain] = useState(site.domain);
  const [siteDescription, setSiteDescription] = useState(site.description);

  const handleDeleteSite = async () => {
    try {
      await deleteSite(site.id);
      setSites((prevSites) => prevSites.filter((s) => s.id !== site.id));
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to delete site:", error);
    }
  };

  const dangerActions = [
    {
      title: "Delete Site",
      description:
        "Permanently remove this website and all its associated data from your account.",
      warning: "This action cannot be undone.",
      buttonText: "Delete Site Permanently",
      onClick: handleDeleteSite,
    },
  ];

  const handleSubmit = () => {
    updateSite(site.id, {
      name: siteName,
      domain: siteDomain,
      description: siteDescription,
    })
      .then(() => {
        setSites((prevSites) =>
          prevSites.map((s) =>
            s.id === site.id
              ? {
                  ...s,
                  name: siteName,
                  domain: siteDomain,
                  description: siteDescription,
                }
              : s
          )
        );
      })
      .catch((error) => {
        console.error("Failed to update site:", error);
      });
  };

  return (
    <Card className="flex flex-col gap-6 w-full overflow-hidden border-none shadow-none">
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
        <CardDescription>
          Manage settings for the {site.name} site.
        </CardDescription>
      </CardHeader>

      <Separator className="w-full" />

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="site_name">Site Name</Label>
          <Input
            id="site_name"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Enter the site name"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="site_domain">Domain</Label>
          <Input
            id="site_domain"
            value={siteDomain}
            onChange={(e) => setSiteDomain(e.target.value)}
            placeholder="Enter the site domain"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="site_description">Description</Label>
          <Input
            id="site_description"
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            placeholder="Enter a brief description of the site"
          />
        </div>
        <Button className="mt-4" onClick={handleSubmit}>
          Update Site Settings
        </Button>
      </CardContent>
      <Card className="border-red-500 shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-md font-medium">Danger Zone</CardTitle>
          <CardDescription>
            Actions below are irreversible. Please proceed with caution.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-2.5 pt-6">
          {dangerActions.map((action, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex flex-col gap-1.5 max-w-[420px]">
                <h3 className="text-sm font-medium">{action.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                  {action.warning && (
                    <>
                      <br />
                      <span className="flex items-center gap-1 mt-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        {action.warning}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <Button
                variant="destructive"
                className="whitespace-nowrap"
                onClick={action.onClick}
              >
                {action.buttonText}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </Card>
  );
}
