import { Loader2 } from 'lucide-react';

export default function Spinner({ label = 'Đang tải...' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
      <Loader2 size={18} className="animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
