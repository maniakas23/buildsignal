import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Plus, Trash2, GitBranch, CheckCircle2, XCircle, Clock } from "lucide-react";

interface Workflow { id: string; name: string; trigger: string; status: "active" | "paused" | "error"; lastRun: string | null; runs: number; actions: string[]; }

export function WorkflowAutomation() {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    { id: "1", name: "New Permit Alert", trigger: "New permit in watchlist county", status: "active", lastRun: "2 hours ago", runs: 142, actions: ["Send email", "Create alert", "Update dashboard"] },
    { id: "2", name: "Weekly Summary", trigger: "Every Monday 9am", status: "active", lastRun: "5 days ago", runs: 12, actions: ["Generate report", "Send email"] },
    { id: "3", name: "High-Value Opportunity", trigger: "Confidence > 90%", status: "paused", lastRun: null, runs: 0, actions: ["Send Slack notification", "Create task"] },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({ name: "", trigger: "", actions: "" });

  const toggleStatus = (id: string) => {
    setWorkflows((prev) => prev.map((w) => ({ ...w, status: w.id === id ? (w.status === "active" ? "paused" : "active") : w.status })));
  };
  const deleteWorkflow = (id: string) => setWorkflows((prev) => prev.filter((w) => w.id !== id));
  const createWorkflow = () => {
    if (!newWorkflow.name.trim()) return;
    const workflow: Workflow = { id: Date.now().toString(), name: newWorkflow.name, trigger: newWorkflow.trigger, status: "active", lastRun: null, runs: 0, actions: newWorkflow.actions.split(",").map((a) => a.trim()).filter(Boolean) };
    setWorkflows((prev) => [...prev, workflow]); setNewWorkflow({ name: "", trigger: "", actions: "" }); setShowCreate(false);
  };

  const statusIcon = { active: <CheckCircle2 className="h-4 w-4 text-green-500" />, paused: <Pause className="h-4 w-4 text-yellow-500" />, error: <XCircle className="h-4 w-4 text-red-500" /> };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Workflow Automation</h2><Button onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4 mr-2"/>New Workflow</Button></div>
      {showCreate && (
        <Card>
          <CardHeader><CardTitle>Create Workflow</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Name</label><Input placeholder="Workflow name" value={newWorkflow.name} onChange={(e) => setNewWorkflow((prev) => ({...prev, name: e.target.value}))}/></div>
            <div className="space-y-2"><label className="text-sm font-medium">Trigger</label>
              <Select value={newWorkflow.trigger} onValueChange={(v) => setNewWorkflow((prev) => ({...prev, trigger: v}))}>
                <SelectTrigger><SelectValue placeholder="Select trigger"/></SelectTrigger>
                <SelectContent><SelectItem value="New permit in watchlist county">New permit in watchlist county</SelectItem><SelectItem value="Every Monday 9am">Every Monday 9am</SelectItem><SelectItem value="Confidence > 90%">Confidence &gt; 90%</SelectItem><SelectItem value="New alert created">New alert created</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Actions (comma-separated)</label><Input placeholder="Send email, Create alert, Update dashboard" value={newWorkflow.actions} onChange={(e) => setNewWorkflow((prev) => ({...prev, actions: e.target.value}))}/></div>
            <div className="flex gap-2"><Button onClick={createWorkflow}>Create</Button><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button></div>
          </CardContent>
        </Card>
      )}
      <div className="space-y-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">{statusIcon[workflow.status]}<CardTitle className="text-base">{workflow.name}</CardTitle></div>
                <div className="flex items-center gap-2"><Switch checked={workflow.status === "active"} onCheckedChange={() => toggleStatus(workflow.id)}/><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteWorkflow(workflow.id)}><Trash2 className="h-4 w-4"/></Button></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm"><GitBranch className="h-4 w-4 text-muted-foreground"/><span className="text-muted-foreground">Trigger:</span><span>{workflow.trigger}</span></div>
                <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-muted-foreground"/><span className="text-muted-foreground">Last run:</span><span>{workflow.lastRun || "Never"}</span></div>
                <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Actions:</span><div className="flex gap-1">{workflow.actions.map((action) => <Badge key={action} variant="secondary" className="text-xs">{action}</Badge>)}</div></div>
                <div className="text-sm text-muted-foreground">{workflow.runs} runs</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
