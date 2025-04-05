"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "./theme-toggle";

export default function LandingNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-background/90 border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">MedThing</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            {/* <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link> */}
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <ThemeToggle />
            {/* <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link> */}
            {user ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/auth">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-muted-foreground p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4 px-2 pb-3">
              <Link href="#features" onClick={toggleMenu} className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
                Features
              </Link>
              {/* <Link href="#" onClick={toggleMenu} className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
                Pricing
              </Link> */}
              <Link href="#" onClick={toggleMenu} className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
                About
              </Link>
              {/* <Link href="#" onClick={toggleMenu} className="text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
                Contact
              </Link> */}
              <ThemeToggle />
              {user ? (
                <Button asChild className="w-full">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <Button asChild className="w-full">
                  <Link href="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 