export type ActivityRow = {
  id: string;
  title: string;
  description: string;
  time: string;
};

export default function RecentActivity({ activities }: { activities: ActivityRow[] }) {
  return (
    <aside className="rounded-lg border bg-white p-5 shadow-sm">
      <h3 className="mb-5 text-lg font-semibold">Recent Activity</h3>
      {activities.length === 0 ? (
        <p className="text-sm leading-6 text-slate-500">No ledger activity is available for this supplier party.</p>
      ) : (
        <div className="space-y-5">
          {activities.map((activity) => (
            <div key={activity.id} className="border-l-2 border-slate-300 pl-4">
              <p className="text-sm font-medium text-slate-950">{activity.title}</p>
              <p className="mt-1 text-sm text-slate-500">{activity.description}</p>
              <span className="mt-2 block text-xs text-slate-400">{activity.time}</span>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
