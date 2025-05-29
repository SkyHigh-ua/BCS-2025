import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Site } from "@/models/Site";
import { useEffect, useState } from "react";
import {
  fetchAllModules,
  fetchModulesByTag,
  getModulesBySiteId,
  toggleModuleForSite,
} from "@/services/moduleService";

export default function Widgets({ site }: { site: Site }): JSX.Element {
  const [modules, setModules] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allModulesData, siteModulesData] = await Promise.all([
          fetchAllModules(),
          getModulesBySiteId(site.id).catch((error) => {
            console.error("Error fetching site modules:", error);
            return [];
          }),
        ]);

        const siteModuleIds = siteModulesData.map((module) => module.id);

        const merged = allModulesData.map((module) => ({
          ...module,
          enabled: siteModuleIds.includes(module.id),
        }));

        setModules(merged);
      } catch (error) {
        console.error("Error fetching modules:", error);
      }
    };

    fetchData();
  }, [site.id]);

  const handleToggleModule = async (module) => {
    setModules((prevModules) =>
      prevModules.map((mod) =>
        mod.id === module.id ? { ...mod, enabled: !mod.enabled } : mod
      )
    );

    try {
      const result = await toggleModuleForSite(
        site.id,
        module.id,
        !module.enabled
      );

      if (!result.success) {
        setModules((prevModules) =>
          prevModules.map((mod) =>
            mod.id === module.id ? { ...mod, enabled: module.enabled } : mod
          )
        );
      }
    } catch (error) {
      console.error("Error toggling module:", error);
      setModules((prevModules) =>
        prevModules.map((mod) =>
          mod.id === module.id ? { ...mod, enabled: module.enabled } : mod
        )
      );
    }
  };

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
        {modules.map((module, index) => (
          <Card key={index} className="flex-1 min-w-[250px]">
            <CardContent className="p-3">
              <div className="flex flex-col h-full">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-base leading-5">
                      {module.name}
                    </h3>
                    <Switch
                      checked={module.enabled}
                      onCheckedChange={() => handleToggleModule(module)}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-6">
                    {module.description}
                  </p>
                </div>

                <div className="mt-auto pt-2.5 flex flex-wrap gap-1">
                  {module.tags.map((tag: string, tagIndex: number) => (
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
  );
}
