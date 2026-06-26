import { mockActivity } from "@/data/mockActivity";

export default function RecentActivity() {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-xl font-semibold">
        Recent Activity
      </h3>

      <div className="space-y-5">
        {mockActivity.map((activity) => (
          <div
            key={activity.id}
            className="border-l-2 border-violet-600 pl-4"
          >
            <p className="font-medium">
              {activity.title}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {activity.description}
            </p>

            <span className="mt-2 block text-xs text-slate-400">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}