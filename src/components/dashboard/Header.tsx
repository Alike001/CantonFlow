import Link from "next/link";
import { Bell, CircleUserRound, HandCoins, LayoutDashboard, Upload } from "lucide-react";
import { getGreeting } from "@/utils/greeting";

const mobileLinks = [
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

export default function Header() {
  return (
    <header className="border-b bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
          {getGreeting()}, Ali
        </h1>

        <p className="text-sm text-slate-500">
          Supplier financing workspace
        </p>
      </div>

      <div className="flex items-center gap-5">
        <Bell className="cursor-pointer text-slate-500" />

        <CircleUserRound
          size={36}
          className="text-violet-700"
        />
      </div>
      </div>

      <nav className="mt-4 grid grid-cols-3 gap-2 lg:hidden">
        {mobileLinks.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs font-medium text-slate-700"
            >
              <Icon className="h-4 w-4" />
              {link.title}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
