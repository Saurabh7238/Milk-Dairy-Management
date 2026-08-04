const MilkEntry = require('../models/MilkEntry');
const dayjs = require('dayjs');

const createMilkEntry = async (req, res) => {
  try {
    const { date, cowMorning, cowEvening, buffaloMorning, buffaloEvening, remarks } = req.body;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const entryDate = dayjs(date).startOf('day');
    if (entryDate.isAfter(dayjs().startOf('day'))) {
      return res.status(400).json({ message: 'No future dates are allowed' });
    }

    const normalizedCowMorning = Number(cowMorning || 0);
    const normalizedCowEvening = Number(cowEvening || 0);
    const normalizedBuffaloMorning = Number(buffaloMorning || 0);
    const normalizedBuffaloEvening = Number(buffaloEvening || 0);

    const entry = await MilkEntry.findOneAndUpdate(
      { date: entryDate.toDate(), userId: req.user.id, buyerId: req.body.buyerId },
      {
        date: entryDate.toDate(),
        userId: req.user.id,
        buyerId: req.body.buyerId,
        cowMorning: normalizedCowMorning,
        cowEvening: normalizedCowEvening,
        cowTotal: normalizedCowMorning + normalizedCowEvening,
        buffaloMorning: normalizedBuffaloMorning,
        buffaloEvening: normalizedBuffaloEvening,
        buffaloTotal: normalizedBuffaloMorning + normalizedBuffaloEvening,
        remarks,
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );

    return res.status(201).json(entry);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to save milk entry' });
  }
};

const getMilkEntries = async (req, res) => {
  try {
    const filter = { userId: req.user.id };
    if (req.query.buyerId) filter.buyerId = req.query.buyerId;
    const entries = await MilkEntry.find(filter).populate('buyerId').sort({ date: 1 });
    return res.json(entries);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch milk entries' });
  }
};

const updateMilkEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const normalizedCowMorning = Number(update.cowMorning || 0);
    const normalizedCowEvening = Number(update.cowEvening || 0);
    const normalizedBuffaloMorning = Number(update.buffaloMorning || 0);
    const normalizedBuffaloEvening = Number(update.buffaloEvening || 0);

    const entry = await MilkEntry.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      {
        ...update,
        buyerId: update.buyerId,
        cowMorning: normalizedCowMorning,
        cowEvening: normalizedCowEvening,
        cowTotal: normalizedCowMorning + normalizedCowEvening,
        buffaloMorning: normalizedBuffaloMorning,
        buffaloEvening: normalizedBuffaloEvening,
        buffaloTotal: normalizedBuffaloMorning + normalizedBuffaloEvening,
      },
      { new: true, runValidators: true },
    );
    return res.json(entry);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update milk entry' });
  }
};

const deleteMilkEntry = async (req, res) => {
  try {
    await MilkEntry.deleteOne({ _id: req.params.id, userId: req.user.id });
    return res.json({ message: 'Milk entry deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to delete milk entry' });
  }
};

module.exports = { createMilkEntry, getMilkEntries, updateMilkEntry, deleteMilkEntry };
