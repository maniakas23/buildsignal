import { useState } from "react";
import { Network, Share2, ArrowRight, MapPin, TrendingUp, Users } from "lucide-react";

export function KestovarKnowledgeGraphV2() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const nodes = [
    { id: "harris", name: "Harris County, TX", type: "county", connections: 12, signals: 8, alerts: 2 },
    { id: "maricopa", name: "Maricopa County, AZ", type: "county", connections: 9, signals: 6, alerts: 1 },
    { id: "travis", name: "Travis County, TX", type: "county", connections: 10, signals: 7, alerts: 0 },
    { id: "energy", name: "Energy Sector", type: "sector", connections: 8, signals: 5, alerts: 1 },
    { id: "infrastructure", name: "Infrastructure", type: "sector", connections: 11, signals: 9, alerts: 3 },
    { id: "tech", name: "Tech Sector", type: "sector", connections: 6, signals: 4, alerts: 0 },
  ];

  const edges = [
    { from: "harris", to: "energy", strength: 0.9 },
    { from: "harris", to: "infrastructure", strength: 0.8 },
    { from: "maricopa", to: "tech", strength: 0.7 },
    { from: "maricopa", to: "infrastructure", strength: 0.6 },
    { from: "travis", to: "tech", strength: 0.8 },
    { from: "travis", to: "energy", strength: 0.5 },
  ];

  const selectedNodeData = nodes.find((n) => n.id === selectedNode);

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Network className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Knowledge Graph V2</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          <div className="text-sm font-medium text-muted-foreground mb-2">Network Nodes</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {nodes.map((node) => (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  selectedNode === node.id ? "border-primary bg-primary/5" : "hover:bg-accent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{node.name}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {node.connections} connections | {node.signals} signals | {node.alerts} alerts
                </div>
              </button>
            ))}
          </div>

          <div className="text-sm font-medium text-muted-foreground mt-4 mb-2">Connections</div>
          <div className="space-y-1">
            {edges.map((edge, i) => {
              const from = nodes.find((n) => n.id === edge.from);
              const to = nodes.find((n) => n.id === edge.to);
              return (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-accent text-sm">
                  <span>{from?.name}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span>{to?.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{(edge.strength * 100).toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          {selectedNodeData ? (
            <div className="p-4 rounded-lg bg-accent">
              <div className="text-sm font-medium mb-3">{selectedNodeData.name}</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <span className="capitalize">{selectedNodeData.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Connections</span>
                  <span>{selectedNodeData.connections}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Signals</span>
                  <span className="text-green-500">{selectedNodeData.signals}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Alerts</span>
                  <span className="text-red-500">{selectedNodeData.alerts}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-accent text-sm text-muted-foreground">
              Select a node to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
