import React, { useEffect, useState } from "react";
import Widget from "@/components/Widget/Widget";
import { getModulesBySiteId } from "@/services/moduleService";

export function Main({ siteId }: { siteId: string }): JSX.Element {
  const [widgets, setWidgets] = useState<
    { id: number; title: string; content: string }[]
  >([]);

  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        const fetchedWidgets = await getModulesBySiteId(siteId);
        setWidgets(fetchedWidgets);
      } catch (error) {
        console.error("Failed to fetch widgets:", error);
      }
    };

    fetchWidgets();
  }, [siteId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 grid-flow-row-dense auto-rows-min">
      {widgets.map((widget) => (
        <Widget key={widget.id} widgetId={widget.id} siteId={siteId} />
      ))}
    </div>
  );
}
