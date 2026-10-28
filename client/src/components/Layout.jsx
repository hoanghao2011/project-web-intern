import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Wrench,
  Building2,
  Tags,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocketInvalidation } from '../hooks/useSocketInvalidation';
import { ROLE_LABELS } from '../lib/constants';

const NAV_ITEMS = [
  { to: '/', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/equipment', label: 'Thiết bị', icon: Package },
  { to: '/transactions', label: 'Nhập / Xuất kho', icon: ArrowLeftRight },
  { to: '/maintenance', label: 'Bảo trì', icon: Wrench },
  { to: '/sites', label: 'Công trình', icon: Building2 },
  { to: '/categories', label: 'Danh mục', icon: Tags },
];

export default function Layout() {
  const { user, logout } = useAuth();
  useSocketInvalidation();

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-5">
          <Package className="text-blue-600" size={24} />
          <span className="text-lg font-semibold text-slate-800">QL Vật tư & TB</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 px-1">
            <p className="truncate text-sm font-medium text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-500">{ROLE_LABELS[user?.role] || user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
