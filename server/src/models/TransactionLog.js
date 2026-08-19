import mongoose from 'mongoose';

const transactionLogSchema = new mongoose.Schema(
  {
    equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    type: { type: String, enum: ['in', 'out', 'transfer'], required: true },
    quantity: { type: Number, required: true, min: 1 },
    fromSite: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', default: null },
    toSite: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', default: null },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    note: { type: String, trim: true },
    attachment: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('TransactionLog', transactionLogSchema);
