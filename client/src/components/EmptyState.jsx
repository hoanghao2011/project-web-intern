import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'Không có dữ liệu' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
      <Inbox size={28} />
      <span className="text-sm">{message}</span>
    </div>
  );
}
