"use client"

import * as React from "react"
import {
  Bell,
  Check,
  Globe,
  Key,
  Save,
  ShieldCheck,
  User,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Switch } from "@workspace/ui/components/switch"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"

export default function SettingsPage() {
  const [saved, setSaved] = React.useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Platform Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure administrative preferences, notification webhooks, security policies, and integrations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleSave}>
            {saved ? (
              <>
                <Check className="size-4 mr-1.5 text-primary" />
                Saved Changes
              </>
            ) : (
              <>
                <Save className="size-4 mr-1.5" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="general" className="gap-2 text-xs">
            <User className="size-3.5" />
            General & Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 text-xs">
            <Bell className="size-3.5" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2 text-xs">
            <Key className="size-3.5" />
            API & Security
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Admin Profile</CardTitle>
              <CardDescription>
                Publicly displayed author credentials for portfolio and newsletter emails.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Display Name</label>
                  <Input defaultValue="Admin Developer" className="h-9 text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Admin Email</label>
                  <Input defaultValue="admin@portfolio.dev" className="h-9 text-xs font-mono" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Public Bio</label>
                <Input
                  defaultValue="Full-stack engineer crafting high-throughput distributed architectures and modern web apps."
                  className="h-9 text-xs"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Site Configuration</CardTitle>
              <CardDescription>
                Base domain and production URLs for CORS and email links.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Public Website URL</label>
                  <Input defaultValue="https://portfolio.dev" className="h-9 text-xs font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">API Gateway Endpoint</label>
                  <Input defaultValue="https://api.portfolio.dev" className="h-9 text-xs font-mono" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Dispatch Preferences</CardTitle>
              <CardDescription>
                Configure automated alerts when events occur on your portfolio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">New Subscriber Alert</div>
                  <div className="text-xs text-muted-foreground">
                    Receive email notifications immediately when someone subscribes.
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Pending Comments Moderation</div>
                  <div className="text-xs text-muted-foreground">
                    Get pinged whenever a new discussion comment awaits approval.
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Weekly Telemetry Digest</div>
                  <div className="text-xs text-muted-foreground">
                    Receive weekly summary metrics regarding traffic and audience growth.
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API & Security Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base font-semibold">API Credentials</CardTitle>
              <CardDescription>
                Bearer tokens and keys used to communicate with the `@workspace/api` backend service.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Admin Secret Token</label>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    Active
                  </Badge>
                </div>
                <Input
                  type="password"
                  defaultValue="sk_live_99839482938472918374928"
                  className="h-9 text-xs font-mono"
                  readOnly
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" size="sm" className="text-xs">
                  Rotate API Secret
                </Button>
                <Button variant="ghost" size="sm" className="text-xs">
                  View API Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
