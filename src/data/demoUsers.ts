import {
  Building2,
  Landmark,
  Scale,
  type LucideIcon,
} from "lucide-react";

export type DemoRole = "supplier" | "lender" | "regulator";

export interface DemoUser {
  role: DemoRole;
  name: string;
  title: string;
  company: string;
  description: string;
  route: string;
  icon: LucideIcon;
}

export const demoUsers: DemoUser[] = [
  {
    role: "supplier",
    name: "Hammed",
    title: "Supplier",
    company: "Northstar Components Ltd.",
    description:
      "Upload invoices, request financing, and review confidential lender offers.",
    route: "/supplier",
    icon: Building2,
  },
  {
    role: "lender",
    name: "Maya",
    title: "Lender",
    company: "Atlas Private Credit",
    description:
      "Review selectively disclosed invoice opportunities and submit private bids.",
    route: "/lender",
    icon: Landmark,
  },
  {
    role: "regulator",
    name: "Owen",
    title: "Regulator",
    company: "Market Oversight Desk",
    description:
      "Monitor workflow status and compliance metadata without exposing deal terms.",
    route: "/regulator",
    icon: Scale,
  },
];

export const defaultDemoUser = demoUsers[0];
