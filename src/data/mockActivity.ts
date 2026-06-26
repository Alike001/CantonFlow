export interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
}

export const mockActivity: Activity[] = [
  {
    id: "1",
    title: "Invoice INV-2026-001 uploaded",
    description: "Funding request opened for lender bidding.",
    time: "10 minutes ago",
  },
  {
    id: "2",
    title: "New confidential bid received",
    description: "A lender submitted a private financing offer.",
    time: "1 hour ago",
  },
  {
    id: "3",
    title: "Invoice INV-2026-002 funded",
    description: "Funding accepted and settlement initiated.",
    time: "Yesterday",
  },
];