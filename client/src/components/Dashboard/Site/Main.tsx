import React from "react";
import { Card, CardHeader, CardContent } from "@/ui/card";
import Widget from "@/components/Widget/Widget";

const widgets = [
  { id: 1, title: "Widget 1", content: "Content for Widget 1" },
  { id: 2, title: "Widget 2", content: "Content for Widget 2" },
  { id: 3, title: "Widget 3", content: "Content for Widget 3" },
];

export function Main(): JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {widgets.map((widget) => (
        <Card key={widget.id}>
          <CardHeader>{widget.title}</CardHeader>
          <CardContent>
            <Widget id={widget.id} content={widget.content} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
