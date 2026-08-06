import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function WebhooksPage() {
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [events, setEvents] = useState<string[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);

  const eventOptions = [
    "opportunity.created",
    "opportunity.updated",
    "recommendation.created",
    "alert.triggered",
    "export.completed",
  ];

  const toggleEvent = (event: string) => {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const createWebhook = () => {
    if (!url.trim() || events.length === 0) {
      toast.error("Please enter a URL and select at least one event");
      return;
    }
    toast.success("Webhook created");
    setUrl("");
    setSecret("");
    setEvents([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Webhooks</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create Webhook</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Endpoint URL</label>
              <Input
                placeholder="https://your-app.com/webhook"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Secret (optional)</label>
              <Input
                type="password"
                placeholder="Webhook secret for HMAC verification"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Events</label>
              <div className="mt-2 space-y-2">
                {eventOptions.map((event) => (
                  <label key={event} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={events.includes(event)}
                      onChange={() => toggleEvent(event)}
                    />
                    <span className="text-sm">{event}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button onClick={createWebhook} className="w-full">
              Create Webhook
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <p className="text-sm text-gray-500">No webhooks configured</p>
          ) : (
            <div className="space-y-2">
              {webhooks.map((hook, i) => (
                <div key={i} className="p-3 border rounded">
                  <p className="font-medium">{hook.url}</p>
                  <p className="text-sm text-gray-500">{hook.events.join(", ")}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default WebhooksPage;
