import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUp, Lightbulb, CheckCircle2, Check } from "lucide-react";
import { Footer } from "@/components/ui-custom/Footer";

type Status = "planned" | "in-progress" | "completed";

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  votes: number;
  status: Status;
  voted: boolean;
}

const initialFeatures: FeatureRequest[] = [
  {
    id: "1",
    title: "Mobile App",
    description:
      "Native iOS and Android apps for on-the-go access to alerts, reports, and county data.",
    category: "Platform",
    votes: 342,
    status: "planned",
    voted: false,
  },
  {
    id: "2",
    title: "More Counties",
    description:
      "Expand coverage to include all 3,000+ US counties with daily permit data updates.",
    category: "Data",
    votes: 287,
    status: "in-progress",
    voted: false,
  },
  {
    id: "3",
    title: "CSV Export",
    description:
      "One-click CSV export for any report, watchlist, or alert dataset with custom column selection.",
    category: "Export",
    votes: 198,
    status: "completed",
    voted: true,
  },
  {
    id: "4",
    title: "Zapier Integration",
    description:
      "Connect BuildSignal to 5,000+ apps via Zapier for automated workflows and data sync.",
    category: "Integration",
    votes: 156,
    status: "planned",
    voted: false,
  },
  {
    id: "5",
    title: "White-Label Reports",
    description:
      "Custom branding, colors, and logos on exported PDF reports for client presentations.",
    category: "Reporting",
    votes: 134,
    status: "in-progress",
    voted: false,
  },
  {
    id: "6",
    title: "Slack Alerts",
    description:
      "Real-time permit and opportunity alerts delivered directly to your Slack channels.",
    category: "Integration",
    votes: 112,
    status: "completed",
    voted: true,
  },
];

const statusConfig: Record<
  Status,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive"; color: string }
> = {
  planned: { label: "Planned", variant: "secondary", color: "bg-muted" },
  "in-progress": { label: "In Progress", variant: "default", color: "bg-primary/10" },
  completed: { label: "Completed", variant: "outline", color: "bg-green-50" },
};

export function FeatureRequestPage() {
  const [features, setFeatures] = useState<FeatureRequest[]>(initialFeatures);
  const [showForm, setShowForm] = useState(false);
  const [newFeature, setNewFeature] = useState({
    title: "",
    description: "",
    category: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleVote = (id: string) => {
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, votes: f.voted ? f.votes - 1 : f.votes + 1, voted: !f.voted }
          : f
      )
    );
  };

  const handleSubmitIdea = () => {
    if (!newFeature.title.trim() || !newFeature.description.trim() || !newFeature.category)
      return;
    const feature: FeatureRequest = {
      id: String(Date.now()),
      title: newFeature.title,
      description: newFeature.description,
      category: newFeature.category,
      votes: 1,
      status: "planned",
      voted: true,
    };
    setFeatures((prev) => [feature, ...prev]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
      setNewFeature({ title: "", description: "", category: "" });
    }, 2000);
  };

  const planned = features.filter((f) => f.status === "planned");
  const inProgress = features.filter((f) => f.status === "in-progress");
  const completed = features.filter((f) => f.status === "completed");

  const FeatureColumn = ({
    title,
    items,
  }: {
    title: string;
    items: FeatureRequest[];
    status: Status;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-sm">{title}</h3>
        <Badge variant="secondary" className="text-xs">
          {items.length}
        </Badge>
      </div>
      <div className="space-y-3">
        {items.map((feature) => (
          <Card
            key={feature.id}
            className={`${statusConfig[feature.status].color} border transition-shadow hover:shadow-md`}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm leading-tight">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {feature.description}
                  </p>
                </div>
                <Badge
                  variant={statusConfig[feature.status].variant}
                  className="text-[10px] shrink-0"
                >
                  {statusConfig[feature.status].label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px]">
                  {feature.category}
                </Badge>
                <Button
                  variant={feature.voted ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => handleVote(feature.id)}
                >
                  {feature.voted ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <ArrowUp className="h-3 w-3" />
                  )}
                  {feature.votes}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-lg">
            No items yet
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Feature Requests</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Help us improve BuildSignal. Vote on ideas or submit your own.
        </p>
      </div>

      {/* Submit New Idea */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Submit a New Idea
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
              <p className="font-medium">Idea submitted!</p>
              <p className="text-sm text-muted-foreground">
                Thanks for your suggestion. We&apos;ll review it soon.
              </p>
            </div>
          ) : !showForm ? (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Submit New Idea
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Short, descriptive title"
                    value={newFeature.title}
                    onChange={(e) =>
                      setNewFeature((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={newFeature.category}
                    onValueChange={(value) =>
                      setNewFeature((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Platform">Platform</SelectItem>
                      <SelectItem value="Data">Data</SelectItem>
                      <SelectItem value="Export">Export</SelectItem>
                      <SelectItem value="Integration">Integration</SelectItem>
                      <SelectItem value="Reporting">Reporting</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe your idea and why it would be useful..."
                  rows={3}
                  value={newFeature.description}
                  onChange={(e) =>
                    setNewFeature((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setNewFeature({ title: "", description: "", category: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitIdea}
                  disabled={
                    !newFeature.title.trim() ||
                    !newFeature.description.trim() ||
                    !newFeature.category
                  }
                >
                  Submit Idea
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid gap-6 md:grid-cols-3">
        <FeatureColumn title="Planned" items={planned} status="planned" />
        <FeatureColumn title="In Progress" items={inProgress} status="in-progress" />
        <FeatureColumn title="Completed" items={completed} status="completed" />
      </div>

      <Footer />
    </div>
  );
}
