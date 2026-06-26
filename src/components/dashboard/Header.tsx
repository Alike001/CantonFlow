import { Bell, CircleUserRound } from "lucide-react";
import { getGreeting } from "@/utils/greeting";

export default function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b bg-white px-8">
      <div>
        <h1 className="text-2xl font-bold">
          {getGreeting()}, Ali 👋
        </h1>

        <p className="text-slate-500">
          Welcome back to CantonFlow
        </p>
      </div>

      <div className="flex items-center gap-5">
        <Bell className="cursor-pointer text-slate-500" />

        <CircleUserRound
          size={36}
          className="text-violet-700"
        />
      </div>
    </header>
  );
}