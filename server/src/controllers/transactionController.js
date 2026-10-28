import { asyncHandler } from '../utils/asyncHandler.js';
import * as transactionService from '../services/transactionService.js';

export const getTransactions = asyncHandler(async (req, res) => {
  const logs = await transactionService.listTransactions(req.query);
  res.json(logs);
});

export const stockIn = asyncHandler(async (req, res) => {
  const result = await transactionService.stockIn(req.body, req.user._id);
  res.status(201).json(result);
});

export const stockOut = asyncHandler(async (req, res) => {
  const result = await transactionService.stockOut(req.body, req.user._id);
  res.status(201).json(result);
});

export const transfer = asyncHandler(async (req, res) => {
  const result = await transactionService.transfer(req.body, req.user._id);
  res.status(201).json(result);
});
