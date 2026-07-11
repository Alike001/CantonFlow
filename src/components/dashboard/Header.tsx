"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, CircleUserRound, HandCoins, LayoutDashboard, Upload } from "lucide-react";
import { currentUser } from "@/data/currentUser";
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
  const [greeting, setGreeting] = useState("Welcome");
  const [userName, setUserName] = useState(currentUser.name);
  const [userRole, setUserRole] = useState(currentUser.title);
  const [userCompany, setUserCompany] = useState(currentUser.company);

  useEffect(() => {
    function refreshHeaderContext() {
      setGreeting(getGreeting());
      setUserName(window.localStorage.getItem("cantonflow:userName") || currentUser.name);
      setUserRole(window.localStorage.getItem("cantonflow:userRole") || currentUser.title);
      setUserCompany(window.localStorage.getItem("cantonflow:userCompany") || currentUser.company);
    }

    refreshHeaderContext();

    const interval = window.setInterval(refreshHeaderContext, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <header className="border-b bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
            {greeting}, {userName}
          </h1>

          <p className="text-sm text-slate-500">
            {userCompany} · {userRole} workspace
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
