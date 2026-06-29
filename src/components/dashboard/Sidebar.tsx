"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  HandCoins,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  {
    title: "Dashboard",
    href: "/supplier",
    icon: LayoutDashboard,
  },
  {
    title: "Upload",
    href: "/supplier/upload",
    icon: Upload,
  },
  {
    title: "Marketplace",
    href: "/supplier/marketplace",
    icon: HandCoins,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-white lg:flex">
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
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.title}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950",
                isActive && "bg-slate-950 text-white hover:bg-slate-950 hover:text-white"
              )}
            >
              <Icon size={20} />
              {link.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <p className="rounded-lg bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
          Demo mode: DAML integration is queued after the checkpoint.
        </p>
      </div>
    </aside>
  );
}
