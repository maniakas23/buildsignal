import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: string;
  lastActive: string;
}

const demoMembers: TeamMember[] = [
  { id: "1", name: "Demo Admin", role: "Admin", email: "admin@example.com", status: "active", lastActive: "Never" },
  { id: "2", name: "Demo Analyst", role: "Analyst", email: "analyst@example.com", status: "active", lastActive: "Never" },
  { id: "3", name: "Demo Viewer", role: "Viewer", email: "viewer@example.com", status: "active", lastActive: "Never" },
  { id: "4", name: "Demo Invited", role: "Pending", email: "invited@example.com", status: "invited", lastActive: "Never" },
  { id: "5", name: "Demo Inactive", role: "Former", email: "inactive@example.com", status: "inactive", lastActive: "Never" },
];

export function EnterpriseFeaturesPanel() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Enterprise Team</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demoMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{member.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.role} · {member.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">No activity recorded</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Logins</span>
                <span>0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Searches</span>
                <span>0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Exports</span>
                <span>0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Alerts created</span>
                <span>0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EnterpriseFeaturesPanel;
