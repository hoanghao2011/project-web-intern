import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { createTestUser, getAuthToken, createTestEquipment, createTestSite } from '../../test/helpers.js';

describe('transaction routes', () => {
  it('records a stock-in and updates equipment quantity', async () => {
    const staff = await createTestUser('staff');
    const token = getAuthToken(staff);
    const equipment = await createTestEquipment({ quantity: 5 });

    const res = await request(app)
      .post('/api/transactions/stock-in')
      .set('Authorization', `Bearer ${token}`)
      .send({ equipment: equipment._id, quantity: 10 });

    expect(res.status).toBe(201);
    expect(res.body.equipment.quantity).toBe(15);

    const getRes = await request(app)
      .get(`/api/equipment/${equipment._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.body.quantity).toBe(15);
  });

  it('records a stock-out and rejects when exceeding stock', async () => {
    const staff = await createTestUser('staff');
    const token = getAuthToken(staff);
    const equipment = await createTestEquipment({ quantity: 5 });

    const res = await request(app)
      .post('/api/transactions/stock-out')
      .set('Authorization', `Bearer ${token}`)
      .send({ equipment: equipment._id, quantity: 100 });

    expect(res.status).toBe(400);
  });

  it('transfers equipment between sites', async () => {
    const staff = await createTestUser('staff');
    const token = getAuthToken(staff);
    const equipment = await createTestEquipment();
    const site = await createTestSite();

    const res = await request(app)
      .post('/api/transactions/transfer')
      .set('Authorization', `Bearer ${token}`)
      .send({ equipment: equipment._id, toSite: site._id });

    expect(res.status).toBe(201);
    expect(res.body.equipment.currentSite).toBe(String(site._id));
  });
});
