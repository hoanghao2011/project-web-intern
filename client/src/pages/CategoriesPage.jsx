import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoryApi } from '../api/category';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function CategoriesPage() {
  const { user } = useAuth();
  const canManage = ['admin', 'manager'].includes(user?.role);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  function load() {
    setLoading(true);
    categoryApi.list().then(setCategories).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: '', description: '' });
    setModalOpen(true);
  }

  function openEdit(cat) {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || '' });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        await categoryApi.update(editing._id, form);
        toast.success('Đã cập nhật danh mục');
      } else {
        await categoryApi.create(form);
        toast.success('Đã thêm danh mục');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Xóa danh mục này?')) return;
    try {
      await categoryApi.remove(id);
      toast.success('Đã xóa danh mục');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa danh mục');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Danh mục thiết bị</h1>
          <p className="text-sm text-slate-500">Phân loại thiết bị theo nhóm</p>
        </div>
        {canManage && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Thêm danh mục
          </button>
        )}
      </div>

      <Card>
        {loading ? (
          <p className="py-8 text-center text-slate-500">Đang tải...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="pb-2 font-medium">Tên danh mục</th>
                <th className="pb-2 font-medium">Mô tả</th>
                {canManage && <th className="pb-2 font-medium text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} className="border-b border-slate-100">
                  <td className="py-3 font-medium text-slate-800">{cat.name}</td>
                  <td className="py-3 text-slate-500">{cat.description || '—'}</td>
                  {canManage && (
                    <td className="py-3 text-right">
                      <button onClick={() => openEdit(cat)} className="mr-2 rounded p-1.5 text-slate-500 hover:bg-slate-100">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(cat._id)} className="rounded p-1.5 text-rose-500 hover:bg-rose-50">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">Chưa có danh mục nào</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa danh mục' : 'Thêm danh mục'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tên danh mục</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700">
            {editing ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
