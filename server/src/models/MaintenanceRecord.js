import mongoose from 'mongoose';

const maintenanceRecordSchema = new mongoose.Schema(
  {
    equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['periodic', 'repair'], required: true },
    cost: { type: Number, min: 0, default: 0 },
    description: { type: String, trim: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    nextDueDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('MaintenanceRecord', maintenanceRecordSchema);
