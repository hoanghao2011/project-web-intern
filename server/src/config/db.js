import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set in environment variables');
  }
  // Yêu cầu MongoDB chạy dưới dạng replica set (kể cả single-node) để hỗ trợ
  // Mongoose transactions dùng trong transactionService/maintenanceService.
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}
