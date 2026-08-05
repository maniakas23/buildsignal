import { useState } from "react";
import { HelpCircle, X, ChevronRight, BookOpen, Video, MessageSquare, Lightbulb, AlertTriangle } from "lucide-react";

export function HelpTooltip() {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState<string | null>(null);

  const topics = [
    { id: "getting-started", title: "Getting Started", icon: BookOpen, content: "Welcome to BuildSignal. Start by exploring the opportunity map and setting up your county watchlist." },
    { id: "alerts", title: "Understanding Alerts", icon: AlertTriangle, content: "Alerts notify you of significant market changes. You can acknowledge or archive them from the Alerts page." },
    { id: "recommendations", title: "AI Recommendations", icon: Lightbulb, content: "Our AI analyzes market data to provide personalized recommendations. Higher confidence scores indicate stronger signals." },
    { id: "api", title: "API Access", icon: MessageSquare, content: "Professional and Business plans include API access for programmatic integration." },
  ];

  const selectedTopic = topics.find((t) => t.id === topic);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-accent"
        aria-label="Help"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b flex items-center justify-between">
            <span className="font-medium">Help</span>
            <button onClick={() => setIsOpen(false)} aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          {selectedTopic ? (
            <div className="p-4">
              <button
                onClick={() => setTopic(null)}
                className="text-sm text-primary flex items-center gap-1 mb-3"
              >
                <ChevronRight className="h-3 w-3 rotate-180" />
                Back
              </button>
              <div className="flex items-center gap-2 mb-2">
                <selectedTopic.icon className="h-4 w-4 text-primary" />
                <h4 className="font-medium">{selectedTopic.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{selectedTopic.content}</p>
            </div>
          ) : (
            <div className="p-2">
              {topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTopic(t.id)}
                  className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-accent text-left"
                >
                  <t.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{t.title}</span>
                  <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
