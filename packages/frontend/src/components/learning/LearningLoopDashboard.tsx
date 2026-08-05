import { useState } from "react";
import { BookOpen, Brain, TrendingUp, Target, Lightbulb, CheckCircle, Clock } from "lucide-react";

export function LearningLoopDashboard() {
  const [loops] = useState([
    { id: "feedback", name: "User Feedback Loop", status: "active", lastRun: "2 min ago", throughput: "234/min" },
    { id: "model", name: "Model Retraining Loop", status: "active", lastRun: "1 hour ago", throughput: "12/day" },
    { id: "pattern", name: "Pattern Discovery Loop", status: "active", lastRun: "15 min ago", throughput: "89/min" },
    { id: "a_b", name: "A/B Testing Loop", status: "paused", lastRun: "3 hours ago", throughput: "N/A" },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "paused": return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Learning Loops</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Active Loops</div>
          <div className="text-2xl font-bold">3</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Paused</div>
          <div className="text-2xl font-bold">1</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Total Iterations</div>
          <div className="text-2xl font-bold">1,247</div>
        </div>
        <div className="p-4 rounded-lg bg-accent">
          <div className="text-sm text-muted-foreground">Data Points</div>
          <div className="text-2xl font-bold">2.4M</div>
        </div>
      </div>

      <div className="space-y-3">
        {loops.map((loop) => (
          <div key={loop.id} className="flex items-center justify-between p-4 rounded-lg bg-accent">
            <div className="flex items-center gap-3">
              {getStatusIcon(loop.status)}
              <div>
                <div className="text-sm font-medium">{loop.name}</div>
                <div className="text-xs text-muted-foreground">Last run: {loop.lastRun}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Throughput</div>
              <div className="text-sm font-medium">{loop.throughput}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
