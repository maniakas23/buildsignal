import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Menu, Bell, User, LogOut, Search, X, ChevronDown, Map, BarChart3, Lightbulb, Shield, CreditCard, Settings, HelpCircle, Calendar } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { HelpTooltip } from "./HelpTooltip";
import { InAppNotifications } from "../dashboard/InAppNotifications";

export function Navbar() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const user = trpc.auth.me.useQuery();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/opportunities", label: "Opportunities", icon: Map },
    { path: "/recommendations", label: "Recommendations", icon: Lightbulb },
    { path: "/alerts", label: "Alerts", icon: Bell },
    { path: "/operations", label: "Operations", icon: Shield },
    { path: "/demo", label: "Request Demo", icon: Calendar },
  ];

  const handleLogout = () => {
    window.location.href = "https://api.buildsignal.net/auth/logout";
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-bold">BuildSignal</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hidden md:flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
              <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>

            <InAppNotifications />
            <HelpTooltip />

            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-lg p-2 hover:bg-accent"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <ChevronDown className="h-4 w-4 hidden md:block" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card border rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b">
                    <div className="text-sm font-medium">{user.data?.name || "User"}</div>
                    <div className="text-xs text-muted-foreground">{user.data?.email || "No email"}</div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => { navigate("/settings"); setIsUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent text-left"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    <button
                      onClick={() => { navigate("/billing"); setIsUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent text-left"
                    >
                      <CreditCard className="h-4 w-4" />
                      Billing
                    </button>
                    <button
                      onClick={() => { setIsUserMenuOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent text-left text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-accent"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 pt-24">
            <div className="bg-card border rounded-lg shadow-lg max-w-2xl mx-auto">
              <div className="flex items-center gap-3 p-4 border-b">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for counties, opportunities, alerts, or settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                  autoFocus
                />
                <button onClick={() => setIsSearchOpen(false)} aria-label="Close search">
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <div className="p-4">
                <div className="text-sm text-muted-foreground">
                  {searchQuery ? "No results found." : "Start typing to search..."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
