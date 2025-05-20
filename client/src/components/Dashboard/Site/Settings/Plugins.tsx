import { Button } from "@/ui/button";
import { Switch } from "@/ui/switch";
import { AlertTriangle, DownloadIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Site } from "@/models/Site";
import { useEffect, useState } from "react";
import {
  fetchSitePlugin,
  fetchDefaultPlugins,
  assignPluginToSite,
} from "@/services/pluginService";
import { Plugin } from "@/models/Plugin";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function Plugins({ site }: { site: Site }): JSX.Element {
  const [formData, setFormData] = useState<
    { type: string; params?: any; datatype: string; value: any }[]
  >([]);
  const [installationSteps, setInstallationSteps] = useState<string[]>([]);
  const [pluginName, setPluginName] = useState<string>("");
  const [pluginDownloadUrl, setPluginDownloadUrl] = useState<string>("");
  const [hasPlugin, setHasPlugin] = useState<boolean>(false);
  const [availablePlugins, setAvailablePlugins] = useState<Plugin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Fetch available plugins regardless of whether the site has one
        const plugins = await fetchDefaultPlugins();
        setAvailablePlugins(plugins);

        try {
          // Try to fetch the site's plugin
          const plugin = await fetchSitePlugin(site.id);
          setPluginName(plugin.name);
          setPluginDownloadUrl(plugin.downloadUrl);
          setFormData(
            plugin.fields.map((field: any) => ({
              type: field.type,
              params: field.params,
              datatype: field.datatype,
              value: field.value || "",
            }))
          );
          setInstallationSteps(plugin.readme?.split("\n") || []);
          setHasPlugin(true);
        } catch (error) {
          // No plugin found for this site
          console.log("No plugin associated with this site:", error);
          setHasPlugin(false);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [site.id]);

  const handleDownload = () => {
    if (pluginDownloadUrl) {
      window.open(pluginDownloadUrl, "_blank");
    } else {
      console.error("Download URL is not available.");
    }
  };

  const handleAssignPlugin = async (pluginId: string) => {
    try {
      const result = await assignPluginToSite(pluginId, site.id);
      if (result.success) {
        // Reload the plugin data
        const plugin = await fetchSitePlugin(site.id);
        setPluginName(plugin.name);
        setPluginDownloadUrl(plugin.downloadUrl);
        setFormData(
          plugin.fields.map((field: any) => ({
            type: field.type,
            params: field.params,
            datatype: field.datatype,
            value: field.value || "",
          }))
        );
        setInstallationSteps(plugin.readme?.split("\n") || []);
        setHasPlugin(true);
      }
    } catch (error) {
      console.error("Error assigning plugin:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading plugin information...</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center gap-6 p-4 bg-1-shadcn-ui-color-modes-tokens-primary-foreground border border-solid border-1-shadcn-ui-color-modes-sidebar-sidebar-border"
      data-model-id="121:2991"
    >
      <header className="w-full bg-transparent px-4">
        <div className="flex flex-col items-center justify-center gap-1.5 w-full">
          <h1 className="font-leading-true-display-sm-semi-bold text-[color:var(--1-shadcn-ui-color-modes-tokens-foreground)] text-[length:var(--leading-true-display-sm-semi-bold-font-size)] tracking-[var(--leading-true-display-sm-semi-bold-letter-spacing)] leading-[var(--leading-true-display-sm-semi-bold-line-height)]">
            {hasPlugin ? "Connect Your Website" : "Select a Plugin"}
          </h1>
        </div>
      </header>

      {hasPlugin ? (
        <>
          <Card className="w-full shadow-sm">
            <CardContent className="flex items-start justify-between p-6">
              <div className="flex flex-col gap-1.5">
                <p className="text-base font-medium">
                  Detected CMS:{" "}
                  <span className="text-[#2f80ed]">{pluginName}</span>
                </p>
                <p className="text-sm text-muted-foreground max-w-[380px]">
                  To connect your site, install our official plugin and follow
                  the steps below.
                </p>
              </div>
              <div className="relative w-16 h-16 flex items-center justify-center"></div>
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1.5">
                <h3 className="font-medium text-foreground">Download Plugin</h3>
                <p className="text-sm text-muted-foreground">
                  Get the latest version of our {pluginName} plugin to enable
                  seamless integration and monitoring.
                </p>
              </div>
              <Button
                className="flex items-center gap-2"
                onClick={handleDownload}
              >
                <DownloadIcon className="h-4 w-4" />
                <span>Download Plugin</span>
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Installation Instructions:
                  </span>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {installationSteps.map((step, index) => (
                      <li key={index}>
                        {index + 1}. {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full max-w-[645px]">
            <CardHeader className="space-y-1.5">
              <CardTitle className="text-md font-medium">
                Connect to Monitoring Platform
              </CardTitle>
              <CardDescription>
                Enter the credentials or API key provided to authenticate and
                connect this site to your dashboard.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {formData.map((field, index) => (
                <div key={index} className="space-y-1.5">
                  <Label htmlFor={index}>{field.params?.label || index}</Label>
                  {field.type === "input" && (
                    <Input
                      id={index}
                      placeholder={field.params?.placeholder || ""}
                      defaultValue={field.value}
                      className="h-[42px]"
                    />
                  )}
                  {field.type === "select" && (
                    <Select defaultValue={field.value}>
                      <SelectTrigger id={index} className="h-[42px]">
                        <SelectValue
                          placeholder={field.params?.placeholder || ""}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {field.params?.options?.map((option: any) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {field.type === "button" && (
                    <Button className={field.params?.className || ""}>
                      {field.params?.label || "Button"}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>

            <CardFooter>
              <Button className="w-[135px] h-9">Connect Site</Button>
            </CardFooter>
          </Card>
        </>
      ) : (
        <main className="flex flex-col w-full gap-4 p-4 bg-background border border-solid border-1-shadcn-ui-color-modes-sidebar-sidebar-border">
          <header className="flex flex-col py-6 px-4 gap-6 w-full">
            <div className="flex flex-col gap-1.5 w-full">
              <h1 className="text-2xl font-semibold text-foreground">
                Available Plugins
              </h1>
              <p className="text-sm text-muted-foreground">
                Select a plugin that best matches your site's platform to enable
                monitoring and integration.
              </p>
            </div>
            <Separator className="w-full" />
          </header>
          <div className="flex flex-wrap gap-2.5 py-2.5">
            {availablePlugins.map((plugin, index) => (
              <Card key={index} className="flex-1 min-w-[250px]">
                <CardContent className="p-3">
                  <div className="flex flex-col h-full">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-base leading-5">
                          {plugin.name}
                        </h3>
                        <Button
                          size="sm"
                          onClick={() => handleAssignPlugin(String(plugin.id))}
                        >
                          Select
                        </Button>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-6">
                        {plugin.description || "No description available"}
                      </p>
                    </div>

                    <div className="mt-auto pt-2.5 flex flex-wrap gap-1">
                      {plugin.tags?.map((tag: string, tagIndex: number) => (
                        <Badge
                          key={tagIndex}
                          variant="default"
                          className="text-xs font-semibold"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      )}
    </div>
  );
}
