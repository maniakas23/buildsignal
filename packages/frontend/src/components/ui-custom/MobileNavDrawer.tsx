import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/pricing", label: "Pricing" },
  { to: "/security", label: "Security" },
  { to: "/help", label: "Help" },
];

export function MobileNavDrawer() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64">
        <div className="flex flex-col gap-4 mt-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`text-sm ${location.pathname === link.to ? "font-semibold" : "text-gray-600"}`}
            >
              {link.label}
            </Link>
          ))}
          <hr />
          <Link to="/login" onClick={() => setMobileOpen(false)}>
            <Button variant="ghost" className="w-full">Sign In</Button>
          </Link>
          <Link to="/signup" onClick={() => setMobileOpen(false)}>
            <Button className="w-full">Get Started</Button>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNavDrawer;
