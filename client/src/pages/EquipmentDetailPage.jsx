import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';
import { ArrowLeft, Pencil, Printer } from 'lucide-react';
import { equipmentApi } from '../api/equipment';
import { transactionApi } from '../api/transaction';
import { maintenanceApi } from '../api/maintenance';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { STATUS_LABELS, TRANSACTION_TYPE_LABELS, MAINTENANCE_TYPE_LABELS } from '../lib/constants';
import { formatCurrency, formatDate, resolveFileUrl } from '../lib/format';
import { useAuth } from '../context/AuthContext';

// Vòng đời thiết bị hợp lệ — phải khớp với STATUS_TRANSITIONS ở backend (models/Equipment.js)
const STATUS_TRANSITIONS = {
  in_stock: ['active', 'maintenance', 'liquidated'],
  active: ['maintenance', 'broken', 'in_stock'],
  maintenance: ['active', 'broken', 'liquidated'],
  broken: ['maintenance', 'liquidated'],
  liquidated: [],
};

export default function EquipmentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const canManage = ['admin', 'manager', 'staff'].includes(user?.role);
  const [equipment, setEquipment] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    Promise.all([
      equipmentApi.getById(id),
      transactionApi.list({ equipment: id }),
      maintenanceApi.list({ equipment: id }),
    ])
      .then(([eq, tx, mt]) => {
        setEquipment(eq);
        setTransactions(tx);
        setMaintenance(mt);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleStatusChange(newStatus) {
    try {
      await equipmentApi.changeStatus(id, newStatus);
      toast.success('Đã cập nhật trạng thái');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể chuyển trạng thái');
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) return <p className="py-8 text-center text-slate-500">Đang tải...</p>;
  if (!equipment) return <p className="py-8 text-center text-slate-400">Không tìm thấy thiết bị</p>;

  const allowedNext = STATUS_TRANSITIONS[equipment.status] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Link to="/equipment" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft size={15} /> Quay lại danh sách
        </Link>
        {canManage && (
          <Link
            to={`/equipment/${id}/edit`}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={15} /> Sửa thông tin
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">{equipment.name}</h1>
              <p className="mt-1 font-mono text-sm text-slate-500">{equipment.code}</p>
            </div>
            <StatusBadge status={equipment.status} />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div><p className="text-slate-500">Danh mục</p><p className="font-medium text-slate-800">{equipment.category?.name}</p></div>
            <div><p className="text-slate-500">Số lượng</p><p className="font-medium text-slate-800">{equipment.quantity} {equipment.unit}</p></div>
            <div><p className="text-slate-500">Đơn giá</p><p className="font-medium text-slate-800">{formatCurrency(equipment.price)}</p></div>
            <div><p className="text-slate-500">Ngày mua</p><p className="font-medium text-slate-800">{formatDate(equipment.purchaseDate)}</p></div>
            <div><p className="text-slate-500">Công trình hiện tại</p><p className="font-medium text-slate-800">{equipment.currentSite?.name || 'Trong kho'}</p></div>
            <div><p className="text-slate-500">Bảo trì kế tiếp</p><p className="font-medium text-slate-800">{formatDate(equipment.nextMaintenanceDate)}</p></div>
          </div>

          {equipment.note && (
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{equipment.note}</div>
          )}

          {equipment.images?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {equipment.images.map((img) => (
                <a key={img} href={resolveFileUrl(img)} target="_blank" rel="noreferrer">
                  <img
                    src={resolveFileUrl(img)}
                    alt={equipment.name}
                    className="h-20 w-20 rounded-lg border border-slate-200 object-cover"
                  />
                </a>
              ))}
            </div>
          )}

          {canManage && allowedNext.length > 0 && (
            <div className="mt-5 border-t border-slate-100 pt-4 print:hidden">
              <p className="mb-2 text-sm font-medium text-slate-700">Chuyển trạng thái</p>
              <div className="flex flex-wrap gap-2">
                {allowedNext.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    → {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="flex flex-col items-center justify-center gap-3">
          <p className="text-sm font-medium text-slate-700">Mã QR tra cứu</p>
          <div className="rounded-lg border border-slate-200 p-3">
            <QRCode value={`${window.location.origin}/equipment/${equipment._id}`} size={140} />
          </div>
          <p className="font-mono text-xs text-slate-500">{equipment.code}</p>
          <button
            onClick={handlePrint}
            className="mt-2 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 print:hidden"
          >
            <Printer size={14} /> In tem QR
          </button>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 print:hidden">
        <Card title="Lịch sử nhập / xuất kho">
          <ul className="space-y-3">
            {transactions.map((tx) => (
              <li key={tx._id} className="border-b border-slate-100 pb-2 text-sm last:border-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{TRANSACTION_TYPE_LABELS[tx.type]}</span>
                  <span className="text-xs text-slate-400">{formatDate(tx.date)}</span>
                </div>
                <p className="text-xs text-slate-500">
                  SL: {tx.quantity} {tx.toSite ? `→ ${tx.toSite.name}` : ''} {tx.note ? `• ${tx.note}` : ''}
                </p>
              </li>
            ))}
            {transactions.length === 0 && <p className="py-4 text-center text-sm text-slate-400">Chưa có giao dịch nào</p>}
          </ul>
        </Card>

        <Card title="Lịch sử bảo trì / sửa chữa">
          <ul className="space-y-3">
            {maintenance.map((m) => (
              <li key={m._id} className="border-b border-slate-100 pb-2 text-sm last:border-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{MAINTENANCE_TYPE_LABELS[m.type]}</span>
                  <span className="text-xs text-slate-400">{formatDate(m.date)}</span>
                </div>
                <p className="text-xs text-slate-500">{m.description} • Chi phí: {formatCurrency(m.cost)}</p>
              </li>
            ))}
            {maintenance.length === 0 && <p className="py-4 text-center text-sm text-slate-400">Chưa có lịch sử bảo trì</p>}
          </ul>
        </Card>
      </div>
    </div>
  );
}
