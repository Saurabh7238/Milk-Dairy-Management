const CurdEntry = require('../models/CurdEntry');
const dayjs = require('dayjs');

const createCurdEntry = async (req, res) => {
  try {
    const { date, quantity, rate, remarks } = req.body;

    if (!date || quantity == null || rate == null) {
      return res.status(400).json({ message: 'Date, quantity, and rate are required' });
    }

    const entryDate = dayjs(date).startOf('day');
    if (entryDate.isAfter(dayjs().startOf('day'))) {
      return res.status(400).json({ message: 'No future dates are allowed' });
    }

    const normalizedQuantity = Number(quantity || 0);
    const normalizedRate = Number(rate || 0);

    const entry = await CurdEntry.findOneAndUpdate(
      { date: entryDate.toDate(), userId: req.user.id, buyerId: req.body.buyerId },
      { date: entryDate.toDate(), userId: req.user.id, buyerId: req.body.buyerId, quantity: normalizedQuantity, rate: normalizedRate, amount: normalizedQuantity * normalizedRate, remarks },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );

    return res.status(201).json(entry);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to save curd entry' });
  }
};

const getCurdEntries = async (req, res) => {
  try {
    const filter = { userId: req.user.id };
    if (req.query.buyerId) filter.buyerId = req.query.buyerId;
    const entries = await CurdEntry.find(filter).populate('buyerId').sort({ date: 1 });
    return res.json(entries);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch curd entries' });
  }
};

const updateCurdEntry = async (req, res) => {
  try {
    const normalizedQuantity = Number(req.body.quantity || 0);
    const normalizedRate = Number(req.body.rate || 0);

    const entry = await CurdEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        ...req.body,
        buyerId: req.body.buyerId,
        quantity: normalizedQuantity,
        rate: normalizedRate,
        amount: normalizedQuantity * normalizedRate,
      },
      {
        new: true,
        runValidators: true,
      },
    );
    return res.json(entry);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update curd entry' });
  }
};

const deleteCurdEntry = async (req, res) => {
  try {
    await CurdEntry.deleteOne({ _id: req.params.id, userId: req.user.id });
    return res.json({ message: 'Curd entry deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to delete curd entry' });
  }
};

module.exports = { createCurdEntry, getCurdEntries, updateCurdEntry, deleteCurdEntry };
