import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { transactionApi } from '../api/transaction';
import { equipmentApi } from '../api/equipment';
import { siteApi } from '../api/site';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { TRANSACTION_TYPE_LABELS } from '../lib/constants';
import { formatDate } from '../lib/format';

const emptyForm = { equipment: '', quantity: 1, toSite: '', note: '' };

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // 'in' | 'out' | null
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    transactionApi.list().then(setTransactions).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    equipmentApi.list({ limit: 100 }).then((res) => setEquipmentOptions(res.items));
    siteApi.list().then(setSites);
  }, []);

  function openModal(type) {
    setForm(emptyForm);
    setModalType(type);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, quantity: Number(form.quantity) };
      if (modalType === 'in') {
        await transactionApi.stockIn(payload);
        toast.success('Đã ghi nhận nhập kho');
      } else {
        await transactionApi.stockOut(payload);
        toast.success('Đã ghi nhận xuất kho');
      }
      setModalType(null);
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
          <h1 className="text-2xl font-semibold text-slate-800">Nhập / Xuất kho</h1>
          <p className="text-sm text-slate-500">Lịch sử giao dịch nhập, xuất và điều chuyển thiết bị</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openModal('in')}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <ArrowDownToLine size={16} /> Nhập kho
          </button>
          <button
            onClick={() => openModal('out')}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <ArrowUpFromLine size={16} /> Xuất kho
          </button>
        </div>
      </div>

      <Card className="!p-0">
        {loading ? (
          <p className="py-8 text-center text-slate-500">Đang tải...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-5 py-3 font-medium">Ngày</th>
                <th className="px-5 py-3 font-medium">Loại</th>
                <th className="px-5 py-3 font-medium">Thiết bị</th>
                <th className="px-5 py-3 font-medium">SL</th>
                <th className="px-5 py-3 font-medium">Công trình</th>
                <th className="px-5 py-3 font-medium">Người thực hiện</th>
                <th className="px-5 py-3 font-medium">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id} className="border-b border-slate-100">
                  <td className="px-5 py-3 text-slate-500">{formatDate(tx.date)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        tx.type === 'in' ? 'bg-emerald-100 text-emerald-700' : tx.type === 'out' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {TRANSACTION_TYPE_LABELS[tx.type]}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-800">{tx.equipment?.name}</td>
                  <td className="px-5 py-3">{tx.quantity}</td>
                  <td className="px-5 py-3 text-slate-500">{tx.toSite?.name || tx.fromSite?.name || '—'}</td>
                  <td className="px-5 py-3 text-slate-500">{tx.performedBy?.name}</td>
                  <td className="px-5 py-3 text-slate-500">{tx.note || '—'}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-slate-400">Chưa có giao dịch nào</td></tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={Boolean(modalType)} onClose={() => setModalType(null)} title={modalType === 'in' ? 'Nhập kho' : 'Xuất kho / Cấp phát'}>
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
                <option key={eq._id} value={eq._id}>{eq.code} — {eq.name} (tồn: {eq.quantity})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Số lượng</label>
            <input
              type="number"
              min={1}
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {modalType === 'in' ? 'Nhập về công trình (tùy chọn)' : 'Cấp phát cho công trình'}
            </label>
            <select
              value={form.toSite}
              onChange={(e) => setForm({ ...form, toSite: e.target.value })}
              required={modalType === 'out'}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">-- Trong kho --</option>
              {sites.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
