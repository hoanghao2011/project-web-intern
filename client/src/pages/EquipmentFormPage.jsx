import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { equipmentApi } from '../api/equipment';
import { categoryApi } from '../api/category';
import { siteApi } from '../api/site';
import Card from '../components/Card';

const schema = z.object({
  name: z.string().min(1, 'Tên thiết bị là bắt buộc'),
  category: z.string().min(1, 'Vui lòng chọn danh mục'),
  code: z.string().optional(),
  quantity: z.coerce.number().min(0, 'Số lượng không hợp lệ'),
  unit: z.string().optional(),
  price: z.coerce.number().min(0, 'Giá không hợp lệ').optional(),
  purchaseDate: z.string().optional(),
  currentSite: z.string().optional(),
  note: z.string().optional(),
});

export default function EquipmentFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [sites, setSites] = useState([]);
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1, unit: 'cái', price: 0 },
  });

  useEffect(() => {
    categoryApi.list().then(setCategories);
    siteApi.list().then(setSites);
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    equipmentApi.getById(id).then((eq) => {
      reset({
        name: eq.name,
        category: eq.category?._id || '',
        code: eq.code,
        quantity: eq.quantity,
        unit: eq.unit,
        price: eq.price,
        purchaseDate: eq.purchaseDate ? eq.purchaseDate.slice(0, 10) : '',
        currentSite: eq.currentSite?._id || '',
        note: eq.note || '',
      });
    });
  }, [id, isEdit, reset]);

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== '') formData.append(key, value);
      });
      images.forEach((file) => formData.append('images', file));

      if (isEdit) {
        await equipmentApi.update(id, formData);
        toast.success('Đã cập nhật thiết bị');
      } else {
        await equipmentApi.create(formData);
        toast.success('Đã thêm thiết bị mới');
      }
      navigate('/equipment');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/equipment" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={15} /> Quay lại danh sách
      </Link>

      <h1 className="text-2xl font-semibold text-slate-800">{isEdit ? 'Sửa thiết bị' : 'Thêm thiết bị mới'}</h1>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Tên thiết bị</label>
            <input {...register('name')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Mã thiết bị (để trống để tự sinh)</label>
            <input {...register('code')} disabled={isEdit} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Danh mục</label>
            <select {...register('category')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs text-rose-600">{errors.category.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Số lượng</label>
            <input type="number" step="1" {...register('quantity')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            {errors.quantity && <p className="mt-1 text-xs text-rose-600">{errors.quantity.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Đơn vị tính</label>
            <input {...register('unit')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Đơn giá (VNĐ)</label>
            <input type="number" step="1000" {...register('price')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Ngày mua</label>
            <input type="date" {...register('purchaseDate')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Công trình hiện tại</label>
            <select {...register('currentSite')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">-- Trong kho --</option>
              {sites.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú</label>
            <textarea {...register('note')} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Hình ảnh thiết bị</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImages(Array.from(e.target.files || []))}
              className="w-full text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm thiết bị'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
