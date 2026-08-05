import { BadgeCheck } from "lucide-react";

export function DemoBadge() {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
      <BadgeCheck className="h-3 w-3" />
      Production Certified
    </div>
  );
}
