import { describe, it, expect } from 'vitest';
import * as maintenanceService from '../maintenanceService.js';
import { createTestEquipment, createTestUser } from '../../test/helpers.js';
import { AppError } from '../../utils/AppError.js';

describe('maintenanceService', () => {
  it('flips status from maintenance to active on repair completion via the shared state machine', async () => {
    const equipment = await createTestEquipment({ status: 'maintenance' });
    const user = await createTestUser('staff');

    const { equipment: updated } = await maintenanceService.createRecord(
      { equipment: equipment._id, type: 'repair', cost: 100, description: 'fixed' },
      user._id
    );

    expect(updated.status).toBe('active');
  });

  it('does not change status for a periodic maintenance record', async () => {
    const equipment = await createTestEquipment({ status: 'maintenance' });
    const user = await createTestUser('staff');

    const { equipment: updated } = await maintenanceService.createRecord(
      { equipment: equipment._id, type: 'periodic', cost: 50, description: 'check' },
      user._id
    );

    expect(updated.status).toBe('maintenance');
  });

  it('throws when equipment is not found', async () => {
    const user = await createTestUser('staff');
    const fakeId = '507f1f77bcf86cd799439011';

    await expect(
      maintenanceService.createRecord({ equipment: fakeId, type: 'repair' }, user._id)
    ).rejects.toThrow(AppError);
  });
});
