import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/ui/card";
import { getWidgetComponent } from "@/services/moduleService";
import StringToReactComponent from "string-to-react-component";
import * as UIComponents from "@/ui/index";
import * as LucidReact from "lucide-react";
import { LoaderCircle } from "lucide-react";

interface WidgetProps {
  widgetId: string | number;
  siteId: string;
}

export default function Widget({ widgetId, siteId }: WidgetProps): JSX.Element {
  const [module, setModule] = useState<any>(null);
  const [componentCode, setComponentCode] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWidgetData = async () => {
      try {
        setLoading(true);
        const responseData = await getWidgetComponent(widgetId, siteId);
        setModule(responseData.module);
        setComponentCode(responseData.component);
        setData(responseData.inputs);
      } catch (err: any) {
        setError(err.message || "Failed to fetch widget data");
        console.error("Error fetching widget:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWidgetData();
  }, [widgetId, siteId]);

  if (loading) {
    return (
      <Card className="h-full flex flex-col p-4 items-center justify-center border-gray-300">
        <LoaderCircle className="w-8 h-8 animate-spin text-primary mb-2" />
        <p>Loading widget...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="text-amber-500 border-red-500 p-4">Error: {error}</Card>
    );
  }

  return (
    <Card
      className={`h-full ${
        componentCode ? "" : "text-amber-500 border-red-500 p-4"
      }`}
    >
      {componentCode ? (
        <StringToReactComponent data={{ UIComponents, LucidReact, data }}>
          {componentCode}
        </StringToReactComponent>
      ) : (
        <CardHeader>
          <h2>No widget component available</h2>
        </CardHeader>
      )}
    </Card>
  );
}
