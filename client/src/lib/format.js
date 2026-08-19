export function formatCurrency(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('vi-VN');
}

// Chuyển đường dẫn tương đối multer trả về (/uploads/...) thành URL đầy đủ tới backend
export function resolveFileUrl(relativePath) {
  if (!relativePath) return '';
  const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
  const serverOrigin = apiBaseUrl.replace(/\/api\/?$/, '');
  return `${serverOrigin}${relativePath}`;
}
