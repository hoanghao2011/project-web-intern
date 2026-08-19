import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Package, Wrench, AlertTriangle, Archive } from 'lucide-react';
import { dashboardApi } from '../api/dashboard';
import Card from '../components/Card';
import { STATUS_LABELS, STATUS_CHART_COLORS } from '../lib/constants';

const MONTH_LABELS = [
  'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12',
];

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2.5 ${tone}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-2xl font-semibold text-slate-800">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function buildTrendData(raw) {
  const map = new Map();
  raw.forEach(({ _id, quantity }) => {
    const key = `${_id.year}-${_id.month}`;
    if (!map.has(key)) map.set(key, { key, year: _id.year, month: _id.month, in: 0, out: 0 });
    map.get(key)[_id.type] = quantity;
  });
  return [...map.values()]
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .map((d) => ({ ...d, label: MONTH_LABELS[d.month - 1] }));
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [statusDist, setStatusDist] = useState([]);
  const [categoryDist, setCategoryDist] = useState([]);
  const [trend, setTrend] = useState([]);
  const [avgAge, setAvgAge] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.summary(),
      dashboardApi.statusDistribution(),
      dashboardApi.categoryDistribution(),
      dashboardApi.monthlyTrend(),
      dashboardApi.averageAge(),
    ])
      .then(([s, status, category, monthlyTrend, age]) => {
        setSummary(s);
        setStatusDist(status);
        setCategoryDist(category);
        setTrend(buildTrendData(monthlyTrend));
        setAvgAge(age);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Tổng quan</h1>
        <p className="text-sm text-slate-500">Thống kê tình trạng thiết bị và vật tư toàn hệ thống</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Package} label="Tổng số thiết bị" value={summary.total} tone="bg-blue-50 text-blue-600" />
        <StatCard icon={Archive} label="Đang hoạt động" value={summary.active} tone="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Wrench} label="Đang bảo trì" value={summary.maintenance} tone="bg-amber-50 text-amber-600" />
        <StatCard
          icon={AlertTriangle}
          label="Quá hạn bảo trì"
          value={summary.overdueMaintenance}
          tone="bg-rose-50 text-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Tỷ lệ trạng thái thiết bị">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusDist}
                dataKey="count"
                nameKey="status"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={2}
              >
                {statusDist.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, STATUS_LABELS[name] || name]} />
              <Legend formatter={(value) => STATUS_LABELS[value] || value} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Tỷ lệ hỏng hóc theo danh mục (%)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryDist} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" unit="%" />
              <YAxis type="category" dataKey="category" width={130} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Tỷ lệ hỏng']} />
              <Bar dataKey="brokenRate" fill="#f43f5e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Xu hướng nhập / xuất kho theo tháng">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend formatter={(v) => (v === 'in' ? 'Nhập kho' : 'Xuất kho')} />
              <Line type="monotone" dataKey="in" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="out" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Tuổi đời trung bình theo danh mục (năm)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={avgAge}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} năm`, 'Tuổi đời TB']} />
              <Bar dataKey="avgAge" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
