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
import { fetchSitePlugin } from "@/services/pluginService";

export default function Plugins({ site }: { site: Site }): JSX.Element {
  const [formData, setFormData] = useState<
    { type: string; params?: any; datatype: string; value: any }[]
  >([]);
  const [installationSteps, setInstallationSteps] = useState<string[]>([]);
  const [pluginName, setPluginName] = useState<string>("");
  const [pluginDownloadUrl, setPluginDownloadUrl] = useState<string>("");

  useEffect(() => {
    async function loadPluginData() {
      try {
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
        setInstallationSteps(plugin.readme.split("\n"));
      } catch (error) {
        console.error("Failed to fetch plugin data:", error);
      }
    }
    loadPluginData();
  }, [site.id]);

  const handleDownload = () => {
    if (pluginDownloadUrl) {
      window.open(pluginDownloadUrl, "_blank");
    } else {
      console.error("Download URL is not available.");
    }
  };

  return (
    <div
      className="flex flex-col items-center gap-6 p-4 bg-1-shadcn-ui-color-modes-tokens-primary-foreground border border-solid border-1-shadcn-ui-color-modes-sidebar-sidebar-border"
      data-model-id="121:2991"
    >
      <header className="w-full bg-transparent px-4">
        <div className="flex flex-col items-center justify-center gap-1.5 w-full">
          <h1 className="font-leading-true-display-sm-semi-bold text-[color:var(--1-shadcn-ui-color-modes-tokens-foreground)] text-[length:var(--leading-true-display-sm-semi-bold-font-size)] tracking-[var(--leading-true-display-sm-semi-bold-letter-spacing)] leading-[var(--leading-true-display-sm-semi-bold-line-height)]">
            Connect Your Website
          </h1>
        </div>
      </header>

      <Card className="w-full shadow-sm">
        <CardContent className="flex items-start justify-between p-6">
          <div className="flex flex-col gap-1.5">
            <p className="text-base font-medium">
              Detected CMS: <span className="text-[#2f80ed]">{pluginName}</span>
            </p>
            <p className="text-sm text-muted-foreground max-w-[380px]">
              To connect your site, install our official plugin and follow the
              steps below.
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
          <Button className="flex items-center gap-2" onClick={handleDownload}>
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
    </div>
  );
}
