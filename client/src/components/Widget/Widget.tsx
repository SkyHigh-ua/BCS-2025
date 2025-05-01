import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/ui/card";
import { getModuleById } from "@/services/moduleService";
import StringToReactComponent from "string-to-react-component";
import * as UIComponents from "@/ui/index";
import { LoaderCircle } from "lucide-react";

interface WidgetProps {
  moduleId: string;
}

export default function Widget({ moduleId }: WidgetProps): JSX.Element {
  const [module, setModule] = useState<any>(null);
  const [inputs, setInputs] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchmodule = async () => {
      try {
        setLoading(true);
        const data = await getModuleById(moduleId);
        setModule(data.module);
        setInputs(data.inputs);
      } catch (err: any) {
        setError(err.message || "Failed to fetch module data");
      } finally {
        setLoading(false);
      }
    };

    fetchmodule();
  }, [moduleId]);

  if (loading) {
    return (
      <Card className="flex flex-col p-4">
        <LoaderCircle />
        Loading...
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
        <h2>{module?.title}</h2>
      </CardHeader>
      <CardContent>
        <p>{module?.description}</p>
        {module?.component && (
          <StringToReactComponent data={{ UIComponents, inputs }}>
            {module.component}
          </StringToReactComponent>
        )}
      </CardContent>
    </Card>
  );
}
