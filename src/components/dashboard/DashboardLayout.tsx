import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
        <div className="flex">
        <Sidebar />

        <div className="flex flex-1 flex-col">
            <Header />

            <main className="flex-1 p-8">
            {children}
            </main>
        </div>
        </div>
    </div>
  );
}