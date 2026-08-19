import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { maintenanceApi } from '../api/maintenance';
import { equipmentApi } from '../api/equipment';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { MAINTENANCE_TYPE_LABELS } from '../lib/constants';
import { formatCurrency, formatDate } from '../lib/format';

const emptyForm = { equipment: '', type: 'periodic', cost: 0, description: '', nextDueDate: '' };

export default function MaintenancePage() {
  const [upcoming, setUpcoming] = useState([]);
  const [records, setRecords] = useState([]);
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([maintenanceApi.upcoming(30), maintenanceApi.list()])
      .then(([up, rec]) => {
        setUpcoming(up);
        setRecords(rec);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    equipmentApi.list({ limit: 100 }).then((res) => setEquipmentOptions(res.items));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await maintenanceApi.create({ ...form, cost: Number(form.cost) });
      toast.success('Đã ghi nhận bảo trì');
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Bảo trì thiết bị</h1>
          <p className="text-sm text-slate-500">Theo dõi lịch bảo trì định kỳ và sửa chữa</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} /> Ghi nhận bảo trì
        </button>
      </div>

      <Card title="Thiết bị sắp / đã quá hạn bảo trì (30 ngày tới)">
        {loading ? (
          <p className="py-6 text-center text-slate-500">Đang tải...</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {upcoming.map((eq) => (
              <li key={eq._id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  {eq.isOverdue && <AlertTriangle size={16} className="text-rose-500" />}
                  <div>
                    <Link to={`/equipment/${eq._id}`} className="text-sm font-medium text-slate-800 hover:text-blue-600">
                      {eq.name}
                    </Link>
                    <p className="text-xs text-slate-500">{eq.category?.name} • {eq.currentSite?.name || 'Trong kho'}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${eq.isOverdue ? 'text-rose-600' : 'text-amber-600'}`}>
                  {eq.isOverdue ? 'Quá hạn: ' : 'Hạn: '}{formatDate(eq.nextMaintenanceDate)}
                </span>
              </li>
            ))}
            {upcoming.length === 0 && <p className="py-6 text-center text-slate-400">Không có thiết bị nào sắp đến hạn</p>}
          </ul>
        )}
      </Card>

      <Card title="Lịch sử bảo trì / sửa chữa">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="pb-2 font-medium">Ngày</th>
              <th className="pb-2 font-medium">Thiết bị</th>
              <th className="pb-2 font-medium">Loại</th>
              <th className="pb-2 font-medium">Chi phí</th>
              <th className="pb-2 font-medium">Người thực hiện</th>
              <th className="pb-2 font-medium">Mô tả</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id} className="border-b border-slate-100">
                <td className="py-3 text-slate-500">{formatDate(r.date)}</td>
                <td className="py-3 font-medium text-slate-800">{r.equipment?.name}</td>
                <td className="py-3">{MAINTENANCE_TYPE_LABELS[r.type]}</td>
                <td className="py-3 text-slate-500">{formatCurrency(r.cost)}</td>
                <td className="py-3 text-slate-500">{r.performedBy?.name}</td>
                <td className="py-3 text-slate-500">{r.description || '—'}</td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-slate-400">Chưa có lịch sử bảo trì</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ghi nhận bảo trì / sửa chữa">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Thiết bị</label>
            <select
              required
              value={form.equipment}
              onChange={(e) => setForm({ ...form, equipment: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">-- Chọn thiết bị --</option>
              {equipmentOptions.map((eq) => (
                <option key={eq._id} value={eq._id}>{eq.code} — {eq.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Loại</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="periodic">Định kỳ</option>
              <option value="repair">Sửa chữa</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Chi phí (VNĐ)</label>
            <input
              type="number"
              min={0}
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Lịch bảo trì kế tiếp</label>
            <input
              type="date"
              value={form.nextDueDate}
              onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? 'Đang lưu...' : 'Xác nhận'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
