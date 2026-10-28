import User from '../models/User.js';
import Category from '../models/Category.js';
import Site from '../models/Site.js';
import Equipment from '../models/Equipment.js';
import { generateToken } from '../utils/generateToken.js';

let userCounter = 0;

export async function createTestUser(role = 'staff', overrides = {}) {
  userCounter += 1;
  const user = await User.create({
    name: `Test ${role} ${userCounter}`,
    email: `${role}${userCounter}@test.dev`,
    password: 'password123',
    role,
    ...overrides,
  });
  return user;
}

export function getAuthToken(user) {
  return generateToken(user);
}

export async function createTestCategory(overrides = {}) {
  return Category.create({ name: `Category ${Date.now()}-${Math.random()}`, ...overrides });
}

export async function createTestSite(overrides = {}) {
  return Site.create({ name: `Site ${Date.now()}-${Math.random()}`, ...overrides });
}

export async function createTestEquipment(overrides = {}) {
  const category = overrides.category || (await createTestCategory())._id;
  return Equipment.create({
    code: Equipment.generateCode(),
    name: 'Test Equipment',
    category,
    quantity: 10,
    ...overrides,
  });
}
