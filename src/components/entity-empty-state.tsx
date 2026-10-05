import Link from "next/link";
import { FolderSearch } from "lucide-react";

export function EmptyState({
  title,
  description,
  actionLabel = "Explorar técnicos",
  actionHref = "/tecnicos",
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <FolderSearch className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <Link href={actionHref} className="mt-6 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
        {actionLabel}
      </Link>
    </div>
  );
}
