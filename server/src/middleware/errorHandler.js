export function notFound(req, res, next) {
  res.status(404).json({ message: `Không tìm thấy đường dẫn: ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({ message: `Giá trị của trường "${field}" đã tồn tại` });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'ID không hợp lệ' });
  }

  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Lỗi máy chủ nội bộ' });
}
