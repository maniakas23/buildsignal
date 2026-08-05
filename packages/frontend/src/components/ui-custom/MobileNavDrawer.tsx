import { useState } from "react";
import { Menu, X, Map, Bell, Settings, User, BarChart3, Lightbulb, Shield, CreditCard, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function MobileNavDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/opportunities", label: "Opportunities", icon: Map },
    { path: "/recommendations", label: "Recommendations", icon: Lightbulb },
    { path: "/alerts", label: "Alerts", icon: Bell },
    { path: "/operations", label: "Operations", icon: Shield },
    { path: "/billing", label: "Billing", icon: CreditCard },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-accent"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold">BuildSignal</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-accent"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
