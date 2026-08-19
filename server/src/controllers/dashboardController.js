import Equipment from '../models/Equipment.js';
import TransactionLog from '../models/TransactionLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getSummary = asyncHandler(async (req, res) => {
  const [total, byStatus] = await Promise.all([
    Equipment.countDocuments(),
    Equipment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const statusMap = byStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});
  const now = new Date();
  const overdueMaintenance = await Equipment.countDocuments({
    nextMaintenanceDate: { $ne: null, $lt: now },
    status: { $ne: 'liquidated' },
  });

  res.json({
    total,
    active: statusMap.active || 0,
    inStock: statusMap.in_stock || 0,
    maintenance: statusMap.maintenance || 0,
    broken: statusMap.broken || 0,
    liquidated: statusMap.liquidated || 0,
    overdueMaintenance,
  });
});

export const getStatusDistribution = asyncHandler(async (req, res) => {
  const data = await Equipment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  res.json(data.map((d) => ({ status: d._id, count: d.count })));
});

export const getCategoryDistribution = asyncHandler(async (req, res) => {
  const data = await Equipment.aggregate([
    {
      $group: {
        _id: '$category',
        total: { $sum: 1 },
        broken: { $sum: { $cond: [{ $eq: ['$status', 'broken'] }, 1, 0] } },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    {
      $project: {
        _id: 0,
        category: '$category.name',
        total: 1,
        broken: 1,
        brokenRate: {
          $cond: [{ $eq: ['$total', 0] }, 0, { $multiply: [{ $divide: ['$broken', '$total'] }, 100] }],
        },
      },
    },
    { $sort: { total: -1 } },
  ]);

  res.json(data);
});

export const getSiteDistribution = asyncHandler(async (req, res) => {
  const data = await Equipment.aggregate([
    { $match: { currentSite: { $ne: null } } },
    {
      $group: {
        _id: '$currentSite',
        count: { $sum: 1 },
        value: { $sum: { $multiply: ['$price', '$quantity'] } },
      },
    },
    { $lookup: { from: 'sites', localField: '_id', foreignField: '_id', as: 'site' } },
    { $unwind: '$site' },
    { $project: { _id: 0, site: '$site.name', count: 1, value: 1 } },
    { $sort: { count: -1 } },
  ]);

  res.json(data);
});

// Xu hướng nhập/xuất theo tháng (12 tháng gần nhất)
export const getMonthlyTrend = asyncHandler(async (req, res) => {
  const since = new Date();
  since.setMonth(since.getMonth() - 11);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const data = await TransactionLog.aggregate([
    { $match: { date: { $gte: since }, type: { $in: ['in', 'out'] } } },
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
        quantity: { $sum: '$quantity' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json(data);
});

// Tuổi đời trung bình (theo năm) của thiết bị, nhóm theo danh mục
export const getAverageAge = asyncHandler(async (req, res) => {
  const data = await Equipment.aggregate([
    { $match: { purchaseDate: { $ne: null } } },
    {
      $project: {
        category: 1,
        ageInYears: { $divide: [{ $subtract: ['$$NOW', '$purchaseDate'] }, 1000 * 60 * 60 * 24 * 365] },
      },
    },
    { $group: { _id: '$category', avgAge: { $avg: '$ageInYears' } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    { $unwind: '$category' },
    { $project: { _id: 0, category: '$category.name', avgAge: { $round: ['$avgAge', 1] } } },
    { $sort: { avgAge: -1 } },
  ]);

  res.json(data);
});
