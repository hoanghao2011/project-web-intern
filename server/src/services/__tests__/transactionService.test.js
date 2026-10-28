import { describe, it, expect, vi, afterEach } from 'vitest';
import mongoose from 'mongoose';
import Equipment from '../../models/Equipment.js';
import TransactionLog from '../../models/TransactionLog.js';
import * as transactionService from '../transactionService.js';
import { createTestEquipment, createTestUser, createTestSite } from '../../test/helpers.js';
import { AppError } from '../../utils/AppError.js';

describe('transactionService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stockIn increases quantity and creates a log', async () => {
    const equipment = await createTestEquipment({ quantity: 5 });
    const user = await createTestUser('staff');

    const { log, equipment: updated } = await transactionService.stockIn(
      { equipment: equipment._id, quantity: 3 },
      user._id
    );

    expect(updated.quantity).toBe(8);
    expect(log.type).toBe('in');
    const logCount = await TransactionLog.countDocuments();
    expect(logCount).toBe(1);
  });

  it('stockOut decreases quantity and flips in_stock to active', async () => {
    const equipment = await createTestEquipment({ quantity: 10, status: 'in_stock' });
    const user = await createTestUser('staff');
    const site = await createTestSite();

    const { equipment: updated } = await transactionService.stockOut(
      { equipment: equipment._id, quantity: 4, toSite: site._id },
      user._id
    );

    expect(updated.quantity).toBe(6);
    expect(updated.status).toBe('active');
  });

  it('stockOut throws AppError when quantity exceeds stock', async () => {
    const equipment = await createTestEquipment({ quantity: 2 });
    const user = await createTestUser('staff');

    await expect(
      transactionService.stockOut({ equipment: equipment._id, quantity: 5 }, user._id)
    ).rejects.toThrow(AppError);

    const unchanged = await Equipment.findById(equipment._id);
    expect(unchanged.quantity).toBe(2);
  });

  it('rolls back equipment quantity change if the log creation fails mid-transaction', async () => {
    const equipment = await createTestEquipment({ quantity: 10 });
    const user = await createTestUser('staff');

    vi.spyOn(TransactionLog, 'create').mockRejectedValueOnce(new Error('simulated failure'));

    await expect(
      transactionService.stockIn({ equipment: equipment._id, quantity: 5 }, user._id)
    ).rejects.toThrow('simulated failure');

    const unchanged = await Equipment.findById(equipment._id);
    expect(unchanged.quantity).toBe(10);
  });
});
