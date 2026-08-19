import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { siteApi } from '../api/site';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const SITE_STATUS_LABELS = { active: 'Đang thi công', completed: 'Đã hoàn thành', paused: 'Tạm dừng' };

const emptyForm = { name: '', address: '', manager: '', status: 'active' };

export default function SitesPage() {
  const { user } = useAuth();
  const canManage = ['admin', 'manager'].includes(user?.role);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  function load() {
    setLoading(true);
    siteApi.list().then(setSites).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(site) {
    setEditing(site);
    setForm({ name: site.name, address: site.address || '', manager: site.manager || '', status: site.status });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        await siteApi.update(editing._id, form);
        toast.success('Đã cập nhật công trình');
      } else {
        await siteApi.create(form);
        toast.success('Đã thêm công trình');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Xóa công trình này?')) return;
    try {
      await siteApi.remove(id);
      toast.success('Đã xóa công trình');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa công trình');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Công trình</h1>
          <p className="text-sm text-slate-500">Danh sách công trình đang triển khai và thiết bị cấp phát</p>
        </div>
        {canManage && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Thêm công trình
          </button>
        )}
      </div>

      {loading ? (
        <p className="py-8 text-center text-slate-500">Đang tải...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <Card key={site._id}>
              <div className="flex items-start justify-between">
                <div>
                  <Link to={`/sites/${site._id}`} className="font-semibold text-slate-800 hover:text-blue-600">
                    {site.name}
                  </Link>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={12} /> {site.address || 'Chưa cập nhật'}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {SITE_STATUS_LABELS[site.status]}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-500">Phụ trách: {site.manager || '—'}</p>
              {canManage && (
                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                  <button onClick={() => openEdit(site)} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100">
                    <Pencil size={13} /> Sửa
                  </button>
                  <button onClick={() => handleDelete(site._id)} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-rose-500 hover:bg-rose-50">
                    <Trash2 size={13} /> Xóa
                  </button>
                </div>
              )}
            </Card>
          ))}
          {sites.length === 0 && <p className="col-span-full py-8 text-center text-slate-400">Chưa có công trình nào</p>}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa công trình' : 'Thêm công trình'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tên công trình</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Địa chỉ</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Người phụ trách</label>
            <input
              value={form.manager}
              onChange={(e) => setForm({ ...form, manager: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Trạng thái</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {Object.entries(SITE_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700">
            {editing ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
