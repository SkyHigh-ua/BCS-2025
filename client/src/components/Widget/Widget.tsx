import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/ui/card";
import { getWidgetComponent } from "@/services/moduleService";
import StringToReactComponent from "string-to-react-component";
import * as UIComponents from "@/ui/index";
import { LoaderCircle } from "lucide-react";

interface WidgetProps {
  moduleId: string;
}

export default function Widget({ moduleId }: WidgetProps): JSX.Element {
  const [module, setModule] = useState<any>(null);
  const [componentCode, setComponentCode] = useState<string | null>(null);
  const [inputs, setInputs] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWidgetData = async () => {
      try {
        setLoading(true);
        const data = await getWidgetComponent(moduleId);
        setModule(data.module);
        setComponentCode(data.component);
        setInputs(data.inputs);
      } catch (err: any) {
        setError(err.message || "Failed to fetch widget data");
        console.error("Error fetching widget:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWidgetData();
  }, [moduleId]);

  if (loading) {
    return (
      <Card className="flex flex-col p-4 items-center justify-center">
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
    <Card>
      <CardHeader>
        <h2>{module?.name}</h2>
      </CardHeader>
      <CardContent>
        <p>{module?.description}</p>
        {componentCode ? (
          <StringToReactComponent data={{ UIComponents, inputs }}>
            {componentCode}
          </StringToReactComponent>
        ) : (
          <p className="text-muted-foreground italic">
            No widget component available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
