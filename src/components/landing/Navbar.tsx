"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Landmark } from "lucide-react";
import { APP } from "@/lib/constants";

const navLinks = [
  {
    name: "Features",
    href: "#features",
  },
  {
    name: "How it Works",
    href: "#workflow",
  },
  {
    name: "Why Canton",
    href: "#why-canton",
  },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-700 text-white">
            <Landmark size={20} />
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight">
              {APP.name}
            </p>

            <p className="text-xs text-slate-500">
              {APP.tagline}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-violet-700"
            >
              {link.name}
            </a>
          ))}
        </nav>

        <Button className="rounded-full">
          Request Demo
        </Button>
      </div>
    </header>
  );
}