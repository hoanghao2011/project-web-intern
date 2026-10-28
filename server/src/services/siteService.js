import Equipment from '../models/Equipment.js';
import { AppError } from '../utils/AppError.js';

export async function assertSiteDeletable(siteId) {
  const inUse = await Equipment.countDocuments({ currentSite: siteId });
  if (inUse > 0) {
    throw new AppError('Không thể xóa công trình đang có thiết bị được cấp phát', 400);
  }
}
