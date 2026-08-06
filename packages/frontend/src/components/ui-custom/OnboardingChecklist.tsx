import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

const checklistItems = [
  { id: "1", label: "Create your account", completed: true },
  { id: "2", label: "Choose your plan", completed: false },
  { id: "3", label: "Set up your areas", completed: false },
  { id: "4", label: "Configure alerts", completed: false },
  { id: "5", label: "Explore signals", completed: false },
];

export function OnboardingChecklist() {
  const [items, setItems] = useState(checklistItems);

  const toggleItem = (id: string) => {
    setItems(items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedCount = items.filter((item) => item.completed).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Getting Started</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Progress value={progress} />
          <p className="text-sm text-gray-500 mt-1">
            {completedCount} of {items.length} completed
          </p>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => toggleItem(item.id)}
              />
              <span className={item.completed ? "line-through text-gray-400" : ""}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <Button className="w-full mt-4" disabled={progress < 100}>
          {progress === 100 ? "All done!" : "Complete all steps"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default OnboardingChecklist;
