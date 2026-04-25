import { cn, getStatusColor } from "@/lib/utils";

export default function StatusBadge({ status }: { status: string }) {
  const c = getStatusColor(status);
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", c.bg, c.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", c.dot)} />
      {status}
    </span>
  );
}
