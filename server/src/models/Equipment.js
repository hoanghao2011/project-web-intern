import mongoose from 'mongoose';
import crypto from 'crypto';

export const EQUIPMENT_STATUSES = ['in_stock', 'active', 'maintenance', 'broken', 'liquidated'];

// Các bước chuyển trạng thái hợp lệ trong vòng đời thiết bị
export const STATUS_TRANSITIONS = {
  in_stock: ['active', 'maintenance', 'liquidated'],
  active: ['maintenance', 'broken', 'in_stock'],
  maintenance: ['active', 'broken', 'liquidated'],
  broken: ['maintenance', 'liquidated'],
  liquidated: [],
};

const equipmentSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    quantity: { type: Number, default: 1, min: 0 },
    unit: { type: String, default: 'cái' },
    purchaseDate: { type: Date },
    price: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: EQUIPMENT_STATUSES, default: 'in_stock' },
    currentSite: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', default: null },
    assignedTo: { type: String, trim: true },
    images: [{ type: String }],
    nextMaintenanceDate: { type: Date, default: null },
    lastMaintenanceDate: { type: Date, default: null },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

equipmentSchema.statics.generateCode = function generateCode(prefix = 'EQ') {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${random}`;
};

export default mongoose.model('Equipment', equipmentSchema);
