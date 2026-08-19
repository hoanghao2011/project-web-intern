export const STATUS_LABELS = {
  in_stock: 'Trong kho',
  active: 'Đang hoạt động',
  maintenance: 'Đang bảo trì',
  broken: 'Hỏng hóc',
  liquidated: 'Đã thanh lý',
};

export const STATUS_COLORS = {
  in_stock: 'bg-slate-100 text-slate-700',
  active: 'bg-emerald-100 text-emerald-700',
  maintenance: 'bg-amber-100 text-amber-700',
  broken: 'bg-rose-100 text-rose-700',
  liquidated: 'bg-gray-200 text-gray-600',
};

export const STATUS_CHART_COLORS = {
  in_stock: '#64748b',
  active: '#10b981',
  maintenance: '#f59e0b',
  broken: '#f43f5e',
  liquidated: '#9ca3af',
};

export const TRANSACTION_TYPE_LABELS = {
  in: 'Nhập kho',
  out: 'Xuất kho',
  transfer: 'Điều chuyển',
};

export const MAINTENANCE_TYPE_LABELS = {
  periodic: 'Định kỳ',
  repair: 'Sửa chữa',
};

export const ROLE_LABELS = {
  admin: 'Quản trị viên',
  manager: 'Quản lý',
  staff: 'Nhân viên',
};
