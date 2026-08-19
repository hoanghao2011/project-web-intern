import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { equipmentApi } from '../api/equipment';
import { categoryApi } from '../api/category';
import { siteApi } from '../api/site';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { STATUS_LABELS } from '../lib/constants';
import { formatCurrency } from '../lib/format';
import { useAuth } from '../context/AuthContext';

export default function EquipmentListPage() {
  const { user } = useAuth();
  const canManage = ['admin', 'manager'].includes(user?.role);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || '';
  const site = searchParams.get('site') || '';
  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    categoryApi.list().then(setCategories);
    siteApi.list().then(setSites);
  }, []);

  useEffect(() => {
    setLoading(true);
    equipmentApi
      .list({ category, status, site, search: searchParams.get('search') || '', page, limit: 15 })
      .then(setData)
      .finally(() => setLoading(false));
  }, [category, status, site, page, searchParams]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    updateParam('search', search);
  }

  function goToPage(p) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Thiết bị</h1>
          <p className="text-sm text-slate-500">Tổng {data.total} thiết bị</p>
        </div>
        {canManage && (
          <button
            onClick={() => navigate('/equipment/new')}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Thêm thiết bị
          </button>
        )}
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[220px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên hoặc mã thiết bị..."
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </form>

          <select
            value={category}
            onChange={(e) => updateParam('category', e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => updateParam('status', e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={site}
            onChange={(e) => updateParam('site', e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Tất cả công trình</option>
            {sites.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="!p-0">
        {loading ? (
          <p className="py-8 text-center text-slate-500">Đang tải...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-5 py-3 font-medium">Mã</th>
                <th className="px-5 py-3 font-medium">Tên thiết bị</th>
                <th className="px-5 py-3 font-medium">Danh mục</th>
                <th className="px-5 py-3 font-medium">Công trình</th>
                <th className="px-5 py-3 font-medium">SL</th>
                <th className="px-5 py-3 font-medium">Giá trị</th>
                <th className="px-5 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((eq) => (
                <tr
                  key={eq._id}
                  onClick={() => navigate(`/equipment/${eq._id}`)}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-5 py-3 font-mono text-xs text-blue-600">{eq.code}</td>
                  <td className="px-5 py-3 font-medium text-slate-800">{eq.name}</td>
                  <td className="px-5 py-3 text-slate-500">{eq.category?.name}</td>
                  <td className="px-5 py-3 text-slate-500">{eq.currentSite?.name || '—'}</td>
                  <td className="px-5 py-3">{eq.quantity} {eq.unit}</td>
                  <td className="px-5 py-3 text-slate-500">{formatCurrency(eq.price)}</td>
                  <td className="px-5 py-3"><StatusBadge status={eq.status} /></td>
                </tr>
              ))}
              {data.items.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-slate-400">Không tìm thấy thiết bị nào</td></tr>
              )}
            </tbody>
          </table>
        )}

        {data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-500">Trang {data.page} / {data.totalPages}</p>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
                className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                disabled={page >= data.totalPages}
                onClick={() => goToPage(page + 1)}
                className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
