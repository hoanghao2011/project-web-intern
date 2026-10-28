import { STATUS_TRANSITIONS } from '../models/Equipment.js';
import { AppError } from '../utils/AppError.js';

export function assertValidTransition(fromStatus, toStatus) {
  const allowed = STATUS_TRANSITIONS[fromStatus] || [];
  if (!allowed.includes(toStatus)) {
    throw new AppError(
      `Không thể chuyển trạng thái từ "${fromStatus}" sang "${toStatus}"`,
      400,
      { allowedNext: allowed }
    );
  }
}

export function applyStatusTransition(equipmentDoc, toStatus) {
  assertValidTransition(equipmentDoc.status, toStatus);
  equipmentDoc.status = toStatus;
  return equipmentDoc;
}
