import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCircle2, Clock, AlertTriangle, Archive, Trash2 } from "lucide-react";

interface ActionItem { id: string; type: "alert" | "task" | "notification"; title: string; description: string; status: "pending" | "completed" | "dismissed"; priority: "high" | "medium" | "low"; createdAt: string; }

export function ActionCenter() {
  const [actions, setActions] = useState<ActionItem[]>([
    { id: "1", type: "alert", title: "Maricopa County surge detected", description: "Building permits up 45% vs last month", status: "pending", priority: "high", createdAt: "2 hours ago" },
    { id: "2", type: "task", title: "Review new recommendation", description: "Harris County commercial opportunity", status: "pending", priority: "medium", createdAt: "5 hours ago" },
    { id: "3", type: "notification", title: "Weekly digest ready", description: "Your weekly summary is available", status: "completed", priority: "low", createdAt: "1 day ago" },
  ]);
  const updateStatus = (id: string, status: ActionItem["status"]) => setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  const pending = actions.filter((a) => a.status === "pending");
  const completed = actions.filter((a) => a.status === "completed");
  const dismissed = actions.filter((a) => a.status === "dismissed");
  const priorityColor = { high: "bg-red-50 text-red-600 border-red-200", medium: "bg-yellow-50 text-yellow-600 border-yellow-200", low: "bg-blue-50 text-blue-600 border-blue-200" };

  const ActionItemCard = ({ action }: { action: ActionItem }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2"><h4 className="font-medium text-sm">{action.title}</h4><Badge variant="outline" className={priorityColor[action.priority]}>{action.priority}</Badge></div>
            <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2"><Clock className="h-3 w-3"/>{action.createdAt}</div>
          </div>
          <div className="flex items-center gap-1">
            {action.status === "pending" && (
              <><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateStatus(action.id, "completed")}><CheckCircle2 className="h-4 w-4 text-green-500"/></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateStatus(action.id, "dismissed")}><Archive className="h-4 w-4"/></Button></>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setActions((prev) => prev.filter((a) => a.id !== action.id))}><Trash2 className="h-4 w-4"/></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold flex items-center gap-2"><Bell className="h-5 w-5"/>Action Center</h2><Badge variant="secondary">{pending.length} pending</Badge></div>
      <Tabs defaultValue="pending">
        <TabsList><TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger><TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger><TabsTrigger value="dismissed">Dismissed ({dismissed.length})</TabsTrigger></TabsList>
        <TabsContent value="pending" className="space-y-2">{pending.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No pending actions</p> : pending.map((action) => <ActionItemCard key={action.id} action={action} />)}</TabsContent>
        <TabsContent value="completed" className="space-y-2">{completed.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No completed actions</p> : completed.map((action) => <ActionItemCard key={action.id} action={action} />)}</TabsContent>
        <TabsContent value="dismissed" className="space-y-2">{dismissed.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No dismissed actions</p> : dismissed.map((action) => <ActionItemCard key={action.id} action={action} />)}</TabsContent>
      </Tabs>
    </div>
  );
}
