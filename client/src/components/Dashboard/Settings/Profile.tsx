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

export default function Profile(): JSX.Element {
  return (
    <Card className="flex flex-col gap-6 w-full overflow-hidden border-none shadow-none">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Manage your profile settings and set e-mail preferences.
        </CardDescription>
      </CardHeader>

      <Separator className="w-full" />

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input id="first_name" placeholder="Enter your first name" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input id="last_name" placeholder="Enter your last name" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter your email" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pfp">Profile Picture (optional)</Label>
          <Input
            id="pfp"
            type="url"
            placeholder="Enter a URL for your profile picture"
          />
        </div>
        <Button className="mt-4">Update Profile</Button>
      </CardContent>
    </Card>
  );
}
