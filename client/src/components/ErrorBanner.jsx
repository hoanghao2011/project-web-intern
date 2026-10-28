import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorBanner({ message = 'Đã có lỗi xảy ra, vui lòng thử lại.', onRetry }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <div className="flex items-center gap-2">
        <AlertCircle size={16} />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-medium hover:bg-rose-100"
        >
          <RefreshCw size={13} /> Thử lại
        </button>
      )}
    </div>
  );
}
