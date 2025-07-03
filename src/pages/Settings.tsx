
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Calendar, Bell, Shield } from "lucide-react";
import ProfileEdit from "@/components/ProfileEdit";
import GoogleCalendarConnect from "@/components/GoogleCalendarConnect";

const Settings = () => {
  const [calendarConnected, setCalendarConnected] = useState(false);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account preferences and integrations</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileEdit />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Google Calendar Integration</CardTitle>
              <CardDescription>
                Connect your Google Calendar to enable smart scheduling and availability matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleCalendarConnect onConnectionChange={setCalendarConnected} />
            </CardContent>
          </Card>

          {calendarConnected && (
            <Card>
              <CardHeader>
                <CardTitle>Calendar Preferences</CardTitle>
                <CardDescription>
                  Configure how your calendar integration works
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-sync match events</p>
                      <p className="text-sm text-gray-600">Automatically add confirmed matches to your calendar</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show availability to others</p>
                      <p className="text-sm text-gray-600">Let other players see when you're available</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Match requests</p>
                    <p className="text-sm text-gray-600">When someone requests to play with you</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Match confirmations</p>
                    <p className="text-sm text-gray-600">When your match requests are accepted</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">AI recommendations</p>
                    <p className="text-sm text-gray-600">When new player matches are found</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Messages</p>
                    <p className="text-sm text-gray-600">When you receive new messages</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control who can see your information and contact you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Profile visibility</p>
                    <p className="text-sm text-gray-600">Who can see your profile</p>
                  </div>
                  <select className="border rounded px-2 py-1">
                    <option>Everyone</option>
                    <option>Verified players only</option>
                    <option>Private</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show location</p>
                    <p className="text-sm text-gray-600">Display your location in search results</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show rating</p>
                    <p className="text-sm text-gray-600">Display your NTRP rating publicly</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
