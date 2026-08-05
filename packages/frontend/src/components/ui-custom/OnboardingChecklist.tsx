import { CheckCircle, Circle, Building2, Map, Bell, Settings, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

export function OnboardingChecklist() {
  const items = [
    { label: "Complete profile", done: true, icon: Building2, path: "/settings" },
    { label: "Explore opportunity map", done: false, icon: Map, path: "/opportunities" },
    { label: "Set up alerts", done: false, icon: Bell, path: "/alerts" },
    { label: "Configure billing", done: false, icon: CreditCard, path: "/billing" },
    { label: "Review settings", done: false, icon: Settings, path: "/settings" },
  ];

  const completed = items.filter((i) => i.done).length;
  const progress = (completed / items.length) * 100;

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm">Getting Started</h3>
        <span className="text-xs text-muted-foreground">{completed}/{items.length}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="flex items-center gap-2 text-sm hover:bg-accent/50 rounded-lg p-2 -mx-2"
          >
            {item.done ? (
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className={item.done ? "text-muted-foreground line-through" : ""}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
