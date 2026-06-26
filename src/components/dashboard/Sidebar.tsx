"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Upload,
  HandCoins,
  Settings,
} from "lucide-react";

const links = [
  {
    title: "Dashboard",
    href: "/supplier",
    icon: LayoutDashboard,
  },
  {
    title: "Invoices",
    href: "/supplier/invoices",
    icon: FileText,
  },
  {
    title: "Upload Invoice",
    href: "/supplier/upload",
    icon: Upload,
  },
  {
    title: "Funding Requests",
    href: "/supplier/requests",
    icon: HandCoins,
  },
];

export default function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r bg-white">
      <div className="border-b p-6">
        <h2 className="text-2xl font-bold text-violet-700">
          <Link href="/">
            CantonFlow
          </Link>
        </h2>

        <p className="text-sm text-slate-500">
          Supplier Portal
        </p>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.title}
              href={link.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"
            >
              <Icon size={20} />
              {link.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-600 hover:bg-slate-100">
          <Settings size={18} />
          Settings
        </button>
      </div>
    </aside>
  );
}