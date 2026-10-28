import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { createTestUser } from '../../test/helpers.js';

describe('auth routes', () => {
  it('registers a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'New User',
      email: 'newuser@test.dev',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('newuser@test.dev');
  });

  it('logs in with correct credentials', async () => {
    await createTestUser('admin', { email: 'admin@test.dev' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.dev', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('rejects login with wrong password', async () => {
    await createTestUser('staff', { email: 'staff@test.dev' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'staff@test.dev', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('rejects login for an inactive user', async () => {
    await createTestUser('staff', { email: 'inactive@test.dev', isActive: false });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inactive@test.dev', password: 'password123' });

    expect(res.status).toBe(403);
  });

  it('returns current user profile via /me', async () => {
    const user = await createTestUser('manager', { email: 'manager@test.dev' });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@test.dev', password: 'password123' });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(String(user._id));
  });
});
