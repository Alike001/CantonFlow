interface StatusBadgeProps {
  status: "Draft" | "Funding Open" | "Funded" | "Settled";
}

const styles = {
  Draft: "bg-slate-100 text-slate-700",
  "Funding Open": "bg-blue-100 text-blue-700",
  Funded: "bg-amber-100 text-amber-700",
  Settled: "bg-green-100 text-green-700",
};

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}