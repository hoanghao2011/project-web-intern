import Site from '../models/Site.js';
import Equipment from '../models/Equipment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { assertSiteDeletable } from '../services/siteService.js';

export const getSites = asyncHandler(async (req, res) => {
  const sites = await Site.find().sort({ createdAt: -1 });
  res.json(sites);
});

export const getSite = asyncHandler(async (req, res) => {
  const site = await Site.findById(req.params.id);
  if (!site) throw new AppError('Không tìm thấy công trình', 404);

  const equipment = await Equipment.find({ currentSite: site._id }).populate('category', 'name');
  res.json({ site, equipment });
});

export const createSite = asyncHandler(async (req, res) => {
  const site = await Site.create(req.body);
  res.status(201).json(site);
});

export const updateSite = asyncHandler(async (req, res) => {
  const site = await Site.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!site) throw new AppError('Không tìm thấy công trình', 404);
  res.json(site);
});

export const deleteSite = asyncHandler(async (req, res) => {
  await assertSiteDeletable(req.params.id);
  const site = await Site.findByIdAndDelete(req.params.id);
  if (!site) throw new AppError('Không tìm thấy công trình', 404);
  res.json({ message: 'Đã xóa công trình' });
});
