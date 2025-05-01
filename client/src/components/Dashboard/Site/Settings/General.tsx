import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";
import { Separator } from "@/ui/separator";
import { useParams } from "react-router-dom";

export default function General(): JSX.Element {
  const { sitename } = useParams();

  return (
    <Card className="flex flex-col gap-6 w-full overflow-hidden border-none shadow-none">
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
        <CardDescription>
          Manage settings for the {sitename} site.
        </CardDescription>
      </CardHeader>

      <Separator className="w-full" />

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="site_name">Site Name</Label>
          <Input id="site_name" placeholder="Enter the site name" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="site_domain">Domain</Label>
          <Input id="site_domain" placeholder="Enter the site domain" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="site_description">Description</Label>
          <Input
            id="site_description"
            placeholder="Enter a brief description of the site"
          />
        </div>
        <Button className="mt-4">Update Site Settings</Button>
      </CardContent>
    </Card>
  );
}
