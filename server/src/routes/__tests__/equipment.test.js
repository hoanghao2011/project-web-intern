import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { createTestUser, getAuthToken, createTestCategory, createTestEquipment } from '../../test/helpers.js';

describe('equipment routes', () => {
  it('lists equipment with pagination', async () => {
    const user = await createTestUser('staff');
    const token = getAuthToken(user);
    await createTestEquipment();
    await createTestEquipment();

    const res = await request(app)
      .get('/api/equipment')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.total).toBe(2);
  });

  it('allows manager to create equipment', async () => {
    const manager = await createTestUser('manager');
    const token = getAuthToken(manager);
    const category = await createTestCategory();

    const res = await request(app)
      .post('/api/equipment')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Máy khoan')
      .field('category', String(category._id));

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Máy khoan');
    expect(res.body.code).toBeTruthy();
  });

  it('forbids staff from creating equipment', async () => {
    const staff = await createTestUser('staff');
    const token = getAuthToken(staff);
    const category = await createTestCategory();

    const res = await request(app)
      .post('/api/equipment')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Máy khoan')
      .field('category', String(category._id));

    expect(res.status).toBe(403);
  });

  it('forbids non-admin from deleting equipment', async () => {
    const manager = await createTestUser('manager');
    const token = getAuthToken(manager);
    const equipment = await createTestEquipment();

    const res = await request(app)
      .delete(`/api/equipment/${equipment._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('changes status through a valid transition', async () => {
    const staff = await createTestUser('staff');
    const token = getAuthToken(staff);
    const equipment = await createTestEquipment({ status: 'in_stock' });

    const res = await request(app)
      .patch(`/api/equipment/${equipment._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'active' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('active');
  });

  it('rejects an invalid status transition with allowedNext', async () => {
    const staff = await createTestUser('staff');
    const token = getAuthToken(staff);
    const equipment = await createTestEquipment({ status: 'liquidated' });

    const res = await request(app)
      .patch(`/api/equipment/${equipment._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'active' });

    expect(res.status).toBe(400);
    expect(res.body.allowedNext).toEqual([]);
  });
});
