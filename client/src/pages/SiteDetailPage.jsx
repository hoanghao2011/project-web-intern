import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { siteApi } from '../api/site';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency } from '../lib/format';

export default function SiteDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    siteApi.getById(id).then(setData).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="py-8 text-center text-slate-500">Đang tải...</p>;
  if (!data) return <p className="py-8 text-center text-slate-400">Không tìm thấy công trình</p>;

  const { site, equipment } = data;
  const totalValue = equipment.reduce((sum, eq) => sum + (eq.price || 0) * (eq.quantity || 0), 0);

  return (
    <div className="space-y-6">
      <Link to="/sites" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={15} /> Quay lại danh sách công trình
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-slate-800">{site.name}</h1>
        <p className="text-sm text-slate-500">{site.address}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><p className="text-sm text-slate-500">Số lượng thiết bị</p><p className="text-xl font-semibold">{equipment.length}</p></Card>
        <Card><p className="text-sm text-slate-500">Người phụ trách</p><p className="text-xl font-semibold">{site.manager || '—'}</p></Card>
        <Card><p className="text-sm text-slate-500">Tổng giá trị</p><p className="text-xl font-semibold">{formatCurrency(totalValue)}</p></Card>
      </div>

      <Card title="Thiết bị đang cấp phát tại công trình">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="pb-2 font-medium">Mã</th>
              <th className="pb-2 font-medium">Tên thiết bị</th>
              <th className="pb-2 font-medium">Danh mục</th>
              <th className="pb-2 font-medium">SL</th>
              <th className="pb-2 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((eq) => (
              <tr key={eq._id} className="border-b border-slate-100">
                <td className="py-3">
                  <Link to={`/equipment/${eq._id}`} className="font-mono text-xs text-blue-600 hover:underline">{eq.code}</Link>
                </td>
                <td className="py-3 font-medium text-slate-800">{eq.name}</td>
                <td className="py-3 text-slate-500">{eq.category?.name}</td>
                <td className="py-3">{eq.quantity}</td>
                <td className="py-3"><StatusBadge status={eq.status} /></td>
              </tr>
            ))}
            {equipment.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-slate-400">Chưa có thiết bị nào tại công trình này</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
