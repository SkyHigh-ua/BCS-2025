import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Site } from "@/models/Site";
import { useEffect, useState } from "react";
import {
  fetchModulesByTag,
  getModulesBySiteId,
} from "@/services/moduleService";

// TODO: add the actual widget logic
export default function Widgets({ site }: { site: Site }): JSX.Element {
  const [allModules, setAllModules] = useState([]);
  const [siteModules, setSiteModules] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allModulesData, siteModulesData] = await Promise.all([
          fetchModulesByTag("all"),
          getModulesBySiteId(site.id),
        ]);
        setAllModules(allModulesData);
        setSiteModules(siteModulesData.map((module) => module.id));
      } catch (error) {
        console.error("Error fetching modules:", error);
      }
    };

    fetchData();
  }, [site.id]);

  const mergedModules = allModules.map((module) => ({
    ...module,
    enabled: siteModules.includes(module.id),
  }));

  return (
    <main
      className="flex flex-col w-full gap-4 p-4 bg-background border border-solid border-1-shadcn-ui-color-modes-sidebar-sidebar-border"
      data-model-id="168:3826"
    >
      <header className="flex flex-col py-6 px-4 gap-6 w-full">
        <div className="flex flex-col gap-1.5 w-full">
          <h1 className="text-2xl font-semibold text-foreground">
            Marketplace
          </h1>
          <p className="text-sm text-muted-foreground">
            Discover add-ons to extend monitoring capabilities, from performance
            insights to security checks.
          </p>
        </div>
        <Separator className="w-full" />
      </header>
      <div className="flex flex-wrap gap-2.5 py-2.5">
        {mergedModules.map((module, index) => (
          <Card key={index} className="flex-1 min-w-[250px]">
            <CardContent className="p-3">
              <div className="flex flex-col h-full">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-base leading-5">
                      {module.title}
                    </h3>
                    <Switch checked={module.enabled} />
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-6">
                    {module.description}
                  </p>
                </div>

                <div className="mt-auto pt-2.5">
                  <Badge variant="default" className="text-xs font-semibold">
                    {module.category}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
