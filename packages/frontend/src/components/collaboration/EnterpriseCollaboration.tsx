import { useState } from "react";
import { Users, Share2, MessageSquare } from "lucide-react";

export function EnterpriseCollaboration() {
  const [activeUsers] = useState(5);

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Team Collaboration</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Active Users</span>
          </div>
          <div className="text-2xl font-bold mt-2">{activeUsers}</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Shared Reports</span>
          </div>
          <div className="text-2xl font-bold mt-2">12</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Comments</span>
          </div>
          <div className="text-2xl font-bold mt-2">48</div>
        </div>
      </div>
    </div>
  );
}
