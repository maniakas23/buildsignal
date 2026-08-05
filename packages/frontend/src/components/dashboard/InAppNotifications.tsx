import { useState, useEffect } from "react";
import { Bell, X, CheckCircle, AlertTriangle, Info } from "lucide-react";

export function InAppNotifications() {
  const [notifications, setNotifications] = useState([
    { id: 1, type: "alert", title: "New permit surge detected in Harris County, TX", message: "15 commercial permits issued in the last 24 hours", time: "2 min ago", read: false },
    { id: 2, type: "recommendation", title: "New recommendation for Maricopa County, AZ", message: "High confidence signal for Q2 commercial development", time: "1 hour ago", read: false },
    { id: 3, type: "info", title: "Weekly digest ready", message: "Your executive briefing for the week is available", time: "3 hours ago", read: true },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "alert": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "recommendation": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-accent"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b flex items-center justify-between">
            <span className="font-medium">Notifications</span>
            <button onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b hover:bg-accent cursor-pointer ${!notification.read ? "bg-blue-50/50" : ""}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-2">
                  {getIcon(notification.type)}
                  <div>
                    <div className="text-sm font-medium">{notification.title}</div>
                    <div className="text-xs text-muted-foreground">{notification.message}</div>
                    <div className="text-xs text-muted-foreground mt-1">{notification.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
