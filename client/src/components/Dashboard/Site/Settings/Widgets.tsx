import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function Widgets(): JSX.Element {
  // Feature card data for mapping
  const featureCards = [
    {
      title: "Activity Log",
      description:
        "Comprehensive tracking of all changes made to your WordPress site. Essential for accountability, troubleshooting, and compliance requirements with searchable history and exportable reports.",
      category: "Audit & Compliance",
      enabled: false,
    },
    {
      title: "Security Scanner",
      description:
        "Continuous monitoring of WordPress, plugin, and theme vulnerabilities. Tracks anomalous activity, file changes, and hacking attempts. Automatically checks compliance with web security best practices and alerts you to potential threats.",
      category: "Security",
      enabled: false,
    },
    {
      title: "Accessibility Checker",
      description:
        "Automatic verification of your site's compliance with WCAG web accessibility standards. Identifies issues that may make it difficult for people with disabilities to use your site and offers specific solutions to ensure inclusivity.",
      category: "Reliability",
      enabled: true,
    },
    {
      title: "SEO Performance",
      description:
        "Comprehensive analysis of your site's search visibility. Tracks keyword rankings, analyzes backlink quality, and identifies technical SEO issues affecting rankings. Helps increase organic traffic and conversions.",
      category: "Marketing",
      enabled: true,
    },
  ];

  // Define module data for mapping
  const modules = [
    {
      title: "Core",
      description:
        "Central hub displaying critical site information and coordinating data across all modules. Acts as the foundation for the entire monitoring system, enabling seamless integration between modules and unified reporting capabilities.",
      category: "Essential",
      enabled: true,
    },
    {
      title: "PageSpeed Analyzer",
      description:
        "Comprehensive analysis of website loading speed with Core Web Vitals metrics. The perfect tool for those looking to enhance user experience through improved site speed.",
      category: "Performance",
      enabled: false,
    },
    {
      title: "Backup Guardian",
      description:
        "Automated backup solution that ensures your site's data security. Creates regular backups with quick restoration capabilities.",
      category: "Security",
      enabled: false,
    },
    {
      title: "Uptime Monitor",
      description:
        "24/7 monitoring of your website's availability with instant notifications when your site goes down. Tracks response time from multiple global locations, identifies patterns in downtime, and provides detailed reports on your website's reliability.",
      category: "Reliability",
      enabled: true,
    },
  ];

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
      <div className="flex flex-wrap gap-2.5 py-2.5">
        {featureCards.map((card, index) => (
          <Card key={index} className="flex-1 min-w-[250px]">
            <CardContent className="p-3">
              <div className="flex flex-col h-[140px] gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-base leading-5 tracking-[-0.10px]">
                    {card.title}
                  </h3>
                  <Switch checked={card.enabled} />
                </div>

                <p className="text-xs text-muted-foreground overflow-hidden text-ellipsis line-clamp-5">
                  {card.description}
                </p>
              </div>

              <div className="mt-2.5">
                <Badge variant="default" className="px-2.5 py-0.5">
                  <span className="text-xs font-semibold text-primary-foreground">
                    {card.category}
                  </span>
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
