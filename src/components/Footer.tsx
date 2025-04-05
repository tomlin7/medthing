"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted py-12">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">MedThing</h3>
            <p className="text-muted-foreground text-sm">
              Revolutionizing medical reporting with AI-powered technology.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook size={18} />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter size={18} />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram size={18} />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Linkedin size={18} />
              </Link>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-4">
            <h3 className="font-bold">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Features
                </Link>
              </li>
              {/* <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Integrations
                </Link>
              </li> */}
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h3 className="font-bold">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h3 className="font-bold">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MedThing. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <Link href="mailto:contact@medthing.com" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
                <Mail size={14} />
                contact@medthing.xyz
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 