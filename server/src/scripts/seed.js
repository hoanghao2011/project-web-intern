import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Site from '../models/Site.js';
import Equipment from '../models/Equipment.js';
import TransactionLog from '../models/TransactionLog.js';
import MaintenanceRecord from '../models/MaintenanceRecord.js';

const CATEGORY_NAMES = [
  'Máy móc xây dựng',
  'Thiết bị điện',
  'Công cụ dụng cụ',
  'Thiết bị văn phòng',
  'Phương tiện vận chuyển',
];

const SITE_DATA = [
  { name: 'Công trình Khu đô thị Ocean Park', address: 'Hưng Yên', manager: 'Nguyễn Văn A', status: 'active' },
  { name: 'Công trình Chung cư Green Bay', address: 'Hải Phòng', manager: 'Trần Văn B', status: 'active' },
  { name: 'Công trình Nhà máy Cần Thơ', address: 'Cần Thơ', manager: 'Lê Thị C', status: 'completed' },
];

const EQUIPMENT_TEMPLATES = [
  { name: 'Máy trộn bê tông', category: 'Máy móc xây dựng', priceRange: [40000000, 80000000] },
  { name: 'Máy khoan bê tông', category: 'Công cụ dụng cụ', priceRange: [3000000, 8000000] },
  { name: 'Xe cẩu tháp', category: 'Phương tiện vận chuyển', priceRange: [500000000, 1200000000] },
  { name: 'Máy phát điện', category: 'Thiết bị điện', priceRange: [20000000, 60000000] },
  { name: 'Máy hàn điện', category: 'Thiết bị điện', priceRange: [2000000, 6000000] },
  { name: 'Máy cắt sắt', category: 'Công cụ dụng cụ', priceRange: [3000000, 7000000] },
  { name: 'Xe tải ben', category: 'Phương tiện vận chuyển', priceRange: [400000000, 900000000] },
  { name: 'Laptop văn phòng', category: 'Thiết bị văn phòng', priceRange: [12000000, 25000000] },
  { name: 'Máy in công trình', category: 'Thiết bị văn phòng', priceRange: [3000000, 9000000] },
  { name: 'Máy đầm bê tông', category: 'Máy móc xây dựng', priceRange: [5000000, 15000000] },
  { name: 'Giàn giáo thép', category: 'Công cụ dụng cụ', priceRange: [500000, 2000000] },
  { name: 'Máy bơm nước công nghiệp', category: 'Thiết bị điện', priceRange: [8000000, 20000000] },
];

const STATUSES = ['in_stock', 'active', 'maintenance', 'broken'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(startYearsAgo, endYearsAgo = 0) {
  const now = Date.now();
  const start = now - startYearsAgo * 365 * 24 * 60 * 60 * 1000;
  const end = now - endYearsAgo * 365 * 24 * 60 * 60 * 1000;
  return new Date(start + Math.random() * (end - start));
}

async function seed() {
  await connectDB();

  console.log('Xóa dữ liệu cũ...');
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Site.deleteMany({}),
    Equipment.deleteMany({}),
    TransactionLog.deleteMany({}),
    MaintenanceRecord.deleteMany({}),
  ]);

  console.log('Tạo tài khoản mẫu...');
  const [admin, manager, staff] = await User.create([
    { name: 'Quản trị viên', email: 'admin@buildco.demo', password: '123456', role: 'admin' },
    { name: 'Trưởng phòng vật tư', email: 'manager@buildco.demo', password: '123456', role: 'manager' },
    { name: 'Nhân viên kho', email: 'staff@buildco.demo', password: '123456', role: 'staff' },
  ]);

  console.log('Tạo danh mục...');
  const categories = await Category.create(
    CATEGORY_NAMES.map((name) => ({ name, description: `Danh mục ${name.toLowerCase()}` }))
  );
  const categoryMap = Object.fromEntries(categories.map((c) => [c.name, c]));

  console.log('Tạo công trình...');
  const sites = await Site.create(SITE_DATA);

  console.log('Tạo thiết bị mẫu...');
  const equipmentDocs = [];
  for (let i = 0; i < 80; i += 1) {
    const template = EQUIPMENT_TEMPLATES[i % EQUIPMENT_TEMPLATES.length];
    const status = STATUSES[randomInt(0, STATUSES.length - 1)];
    const purchaseDate = randomDate(6, 0);
    const hasNextMaintenance = Math.random() > 0.3;

    equipmentDocs.push({
      code: Equipment.generateCode(),
      name: `${template.name} #${i + 1}`,
      category: categoryMap[template.category]._id,
      quantity: randomInt(1, 5),
      unit: 'cái',
      purchaseDate,
      price: randomInt(template.priceRange[0], template.priceRange[1]),
      status,
      currentSite: status === 'in_stock' ? null : sites[randomInt(0, sites.length - 1)]._id,
      nextMaintenanceDate: hasNextMaintenance ? randomDate(-1, -0.05) : null,
      lastMaintenanceDate: Math.random() > 0.5 ? randomDate(1, 0.1) : null,
    });
  }
  const equipment = await Equipment.insertMany(equipmentDocs);

  console.log('Tạo lịch sử giao dịch...');
  const transactionDocs = [];
  for (let i = 0; i < 150; i += 1) {
    const eq = equipment[randomInt(0, equipment.length - 1)];
    const type = Math.random() > 0.5 ? 'in' : 'out';
    transactionDocs.push({
      equipment: eq._id,
      type,
      quantity: randomInt(1, 3),
      fromSite: type === 'out' ? null : undefined,
      toSite: eq.currentSite,
      performedBy: [admin, manager, staff][randomInt(0, 2)]._id,
      date: randomDate(1, 0),
      note: type === 'in' ? 'Nhập kho định kỳ' : 'Cấp phát cho công trình',
    });
  }
  await TransactionLog.insertMany(transactionDocs);

  console.log('Tạo lịch sử bảo trì...');
  const maintenanceDocs = [];
  for (let i = 0; i < 40; i += 1) {
    const eq = equipment[randomInt(0, equipment.length - 1)];
    maintenanceDocs.push({
      equipment: eq._id,
      date: randomDate(1, 0),
      type: Math.random() > 0.5 ? 'periodic' : 'repair',
      cost: randomInt(200000, 5000000),
      description: 'Bảo trì/kiểm tra định kỳ theo lịch',
      performedBy: [admin, manager, staff][randomInt(0, 2)]._id,
      nextDueDate: randomDate(-1, -0.1),
    });
  }
  await MaintenanceRecord.insertMany(maintenanceDocs);

  console.log('\nHoàn tất seed dữ liệu!');
  console.log('Tài khoản demo:');
  console.log('  admin@buildco.demo / 123456 (admin)');
  console.log('  manager@buildco.demo / 123456 (manager)');
  console.log('  staff@buildco.demo / 123456 (staff)');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
