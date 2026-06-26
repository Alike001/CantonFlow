import Link from "next/link";
import { Landmark } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 text-sm text-slate-500 md:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-700 text-white">
            <Landmark size={18} />
          </div>

          <div>
            <p className="font-semibold text-slate-900">
              CantonFlow
            </p>

            <p>Private Trade Finance Infrastructure</p>
          </div>
        </div>

        <div className="flex gap-6">
          <Link
            href="https://github.com/Alike001/CantonFlow"
            target="_blank"
          >
            GitHub
          </Link>

          <Link href="/">
            Built on Canton Network
          </Link>

          <Link href="/">
            Encode Club 2026
          </Link>
        </div>
      </div>
    </footer>
  );
}