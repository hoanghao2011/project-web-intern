import Site from '../models/Site.js';
import Equipment from '../models/Equipment.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getSites = asyncHandler(async (req, res) => {
  const sites = await Site.find().sort({ createdAt: -1 });
  res.json(sites);
});

export const getSite = asyncHandler(async (req, res) => {
  const site = await Site.findById(req.params.id);
  if (!site) return res.status(404).json({ message: 'Không tìm thấy công trình' });

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
  if (!site) return res.status(404).json({ message: 'Không tìm thấy công trình' });
  res.json(site);
});

export const deleteSite = asyncHandler(async (req, res) => {
  const inUse = await Equipment.countDocuments({ currentSite: req.params.id });
  if (inUse > 0) {
    return res.status(400).json({ message: 'Không thể xóa công trình đang có thiết bị được cấp phát' });
  }
  const site = await Site.findByIdAndDelete(req.params.id);
  if (!site) return res.status(404).json({ message: 'Không tìm thấy công trình' });
  res.json({ message: 'Đã xóa công trình' });
});
