import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/pricing", label: "Pricing" },
  { to: "/security", label: "Security" },
  { to: "/help", label: "Help" },
];

export function Navbar() {
  return (
    <nav className="flex items-center justify-between h-16">
      <Link to="/" className="font-bold text-xl">
        BuildSignal
      </Link>

      <div className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="hidden md:flex items-center gap-4">
        <Link to="/login">
          <Button variant="ghost" size="sm">Sign In</Button>
        </Link>
        <Link to="/signup">
          <Button size="sm">Get Started</Button>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
