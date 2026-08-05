import { useState } from "react";
import { Network, Share2, MapPin, TrendingUp, ArrowRight } from "lucide-react";

export function KestovarKnowledgeGraph() {
  const [nodes] = useState([
    { id: "harris", name: "Harris County, TX", type: "county", connections: 12 },
    { id: "maricopa", name: "Maricopa County, AZ", type: "county", connections: 9 },
    { id: "travis", name: "Travis County, TX", type: "county", connections: 10 },
    { id: "energy", name: "Energy Sector", type: "sector", connections: 8 },
    { id: "infrastructure", name: "Infrastructure", type: "sector", connections: 11 },
    { id: "tech", name: "Tech Sector", type: "sector", connections: 6 },
  ]);

  const [edges] = useState([
    { from: "harris", to: "energy" },
    { from: "harris", to: "infrastructure" },
    { from: "maricopa", to: "tech" },
    { from: "maricopa", to: "infrastructure" },
    { from: "travis", to: "tech" },
  ]);

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Network className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Knowledge Graph</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
        {nodes.map((node) => (
          <div key={node.id} className="p-3 rounded-lg bg-accent">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{node.name}</span>
            </div>
            <div className="text-xs text-muted-foreground">{node.connections} connections</div>
          </div>
        ))}
      </div>

      <div className="text-sm font-medium text-muted-foreground mb-2">Relationships</div>
      <div className="space-y-1">
        {edges.map((edge, i) => {
          const from = nodes.find((n) => n.id === edge.from);
          const to = nodes.find((n) => n.id === edge.to);
          return (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-accent text-sm">
              <span>{from?.name}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span>{to?.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
