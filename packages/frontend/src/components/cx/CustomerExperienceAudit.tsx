import { useState } from "react";
import { Heart, Star, MessageSquare } from "lucide-react";

export function CustomerExperienceAudit() {
  const [ratings] = useState([
    { aspect: "Ease of Use", score: 4.5 },
    { aspect: "Data Quality", score: 4.2 },
    { aspect: "Speed", score: 4.0 },
    { aspect: "Support", score: 4.8 },
  ]);

  const avg = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Customer Experience</h3>
      </div>
      <div className="mb-4">
        <div className="text-sm text-muted-foreground">Overall Rating</div>
        <div className="text-3xl font-bold">{avg.toFixed(1)}</div>
      </div>
      <div className="space-y-2">
        {ratings.map((rating) => (
          <div key={rating.aspect} className="flex items-center justify-between p-2 rounded-lg bg-accent">
            <span className="text-sm">{rating.aspect}</span>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">{rating.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
