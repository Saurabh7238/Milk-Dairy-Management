const mongoose = require('mongoose');
const MilkEntry = require('../models/MilkEntry');
const CurdEntry = require('../models/CurdEntry');
const MonthlyRate = require('../models/MonthlyRate');
const Buyer = require('../models/Buyer');
const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');

dayjs.extend(isBetween);

const getDashboard = async (req, res, next) => {
  try {
    const today = dayjs().startOf('day');
    const monthStart = dayjs().startOf('month').toDate();
    const monthEnd = dayjs().endOf('month').toDate();

    const { buyerId } = req.query;
    const dateFilter = (start, end) => ({
      date: {
        $gte: start,
        $lte: end,
      },
    });

    const buyerFilter = {};
    if (buyerId && mongoose.Types.ObjectId.isValid(buyerId)) {
      buyerFilter.buyerId = new mongoose.Types.ObjectId(buyerId);
    }

    const todayEntries = await MilkEntry.find({
      userId: req.user.id,
      ...buyerFilter,
      date: {
        $gte: today.toDate(),
        $lt: today.add(1, 'day').toDate(),
      },
    });

    const monthlyEntries = await MilkEntry.find({
      userId: req.user.id,
      ...buyerFilter,
      ...dateFilter(monthStart, monthEnd),
    });

    const monthlyCurd = await CurdEntry.find({
      userId: req.user.id,
      ...buyerFilter,
      ...dateFilter(monthStart, monthEnd),
    });

    const weeklyEntries = await MilkEntry.find({
      userId: req.user.id,
      ...buyerFilter,
      date: {
        $gte: dayjs().subtract(6, 'day').startOf('day').toDate(),
        $lte: dayjs().endOf('day').toDate(),
      },
    }).sort({ date: 1 });

    const monthStartDay = dayjs().startOf('month');
    const monthlySeries = Array.from({ length: 4 }, (_, index) => {
      const start = monthStartDay.add(index * 7, 'day');
      const end = start.add(6, 'day');
      const weekEntries = monthlyEntries.filter((entry) => {
        const d = dayjs(entry.date);
        return d.isBetween(start, end, 'day', '[]');
      });
      const total = weekEntries.reduce((sum, item) => sum + Number(item.cowTotal || 0) + Number(item.buffaloTotal || 0), 0);
      return total;
    });

    const weeklySeries = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, index) => {
      const day = dayjs().startOf('week').add(index, 'day');
      const matchingEntries = weeklyEntries.filter((entry) => dayjs(entry.date).isSame(day, 'day'));
      return matchingEntries.reduce((sum, item) => sum + Number(item.cowTotal || 0) + Number(item.buffaloTotal || 0), 0);
    });

    const cowToday = todayEntries.reduce((sum, item) => sum + Number(item.cowTotal || 0), 0);
    const buffaloToday = todayEntries.reduce((sum, item) => sum + Number(item.buffaloTotal || 0), 0);
    const totalToday = cowToday + buffaloToday;
    const monthMilkTotal = monthlyEntries.reduce((sum, item) => sum + Number(item.cowTotal || 0) + Number(item.buffaloTotal || 0), 0);
    const curdIncome = monthlyCurd.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const currentMonth = dayjs().month() + 1;
    const currentYear = dayjs().year();
    const defaultRateFilter = {
      userId: req.user.id,
      month: currentMonth,
      year: currentYear,
      $or: [{ buyerId: null }, { buyerId: { $exists: false } }],
    };

    let rates = null;
    if (buyerFilter.buyerId) {
      rates = await MonthlyRate.findOne({ userId: req.user.id, buyerId: buyerFilter.buyerId, month: currentMonth, year: currentYear });
    }
    if (!rates) {
      rates = await MonthlyRate.findOne(defaultRateFilter);
    }

    const cowRate = rates?.cowRate || 0;
    const buffaloRate = rates?.buffaloRate || 0;
    const milkIncome = rates
      ? monthlyEntries.reduce((sum, item) => sum + Number(item.cowTotal || 0) * cowRate + Number(item.buffaloTotal || 0) * buffaloRate, 0)
      : monthlyEntries.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalIncome = milkIncome + curdIncome;

    res.json({
      today: {
        cowMilk: cowToday,
        buffaloMilk: buffaloToday,
        totalMilk: totalToday,
      },
      month: {
        totalMilk: monthMilkTotal,
        milkIncome,
        curdIncome,
        totalIncome,
      },
      monthlyRates: rates || null,
      charts: {
        monthly: monthlySeries,
        weekly: weeklySeries,
      },
      debug: {
        todayEntries: todayEntries.length,
        monthlyEntries: monthlyEntries.length,
        weeklyEntries: weeklyEntries.length,
        buyers: await Buyer.countDocuments({ userId: req.user.id }),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMonthlyReport = async (req, res, next) => {
  try {
    const { month, year, buyerId, fromDate, toDate } = req.query;
    const monthNumber = Number(month || dayjs().month() + 1);
    const yearNumber = Number(year || dayjs().year());

    let monthStart = dayjs(`${yearNumber}-${monthNumber}-01`).startOf('month').toDate();
    let monthEnd = dayjs(`${yearNumber}-${monthNumber}-01`).endOf('month').toDate();

    let rangeStart = fromDate ? dayjs(fromDate).startOf('day').toDate() : monthStart;
    let rangeEnd = toDate ? dayjs(toDate).endOf('day').toDate() : monthEnd;

    if (fromDate && toDate) {
      monthStart = rangeStart;
      monthEnd = rangeEnd;
    }

    const milkQuery = { userId: req.user.id, date: { $gte: rangeStart, $lte: rangeEnd } };
    const curdQuery = { userId: req.user.id, date: { $gte: rangeStart, $lte: rangeEnd } };

    if (buyerId && mongoose.Types.ObjectId.isValid(buyerId)) {
      milkQuery.buyerId = new mongoose.Types.ObjectId(buyerId);
      curdQuery.buyerId = new mongoose.Types.ObjectId(buyerId);
    }

    const milkEntries = await MilkEntry.find(milkQuery).sort({ date: 1 });
    const curdEntries = await CurdEntry.find(curdQuery);

    const rateMonth = fromDate ? dayjs(fromDate).month() + 1 : monthNumber;
    const rateYear = fromDate ? dayjs(fromDate).year() : yearNumber;

    const defaultRateFilter = {
      userId: req.user.id,
      month: rateMonth,
      year: rateYear,
      $or: [{ buyerId: null }, { buyerId: { $exists: false } }],
    };

    let monthlyRate = null;
    if (buyerId && mongoose.Types.ObjectId.isValid(buyerId)) {
      monthlyRate = await MonthlyRate.findOne({ userId: req.user.id, buyerId: new mongoose.Types.ObjectId(buyerId), month: rateMonth, year: rateYear });
    }
    if (!monthlyRate) {
      monthlyRate = await MonthlyRate.findOne(defaultRateFilter);
    }

    const cowMilkTotal = milkEntries.reduce((sum, item) => sum + Number(item.cowTotal || 0), 0);
    const buffaloMilkTotal = milkEntries.reduce((sum, item) => sum + Number(item.buffaloTotal || 0), 0);
    const grandMilkTotal = cowMilkTotal + buffaloMilkTotal;
    const cowRate = monthlyRate?.cowRate || 0;
    const buffaloRate = monthlyRate?.buffaloRate || 0;
    const milkIncome = monthlyRate
      ? cowMilkTotal * cowRate + buffaloMilkTotal * buffaloRate
      : milkEntries.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const curdIncome = curdEntries.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const finalIncome = milkIncome + curdIncome;

    res.json({
      monthName: fromDate && toDate
        ? `${dayjs(fromDate).format('MMM DD')} - ${dayjs(toDate).format('MMM DD, YYYY')}`
        : dayjs(`${yearNumber}-${monthNumber}-01`).format('MMMM'),
      cowMilkTotal,
      buffaloMilkTotal,
      grandMilkTotal,
      cowRate,
      buffaloRate,
      milkIncome,
      curdIncome,
      finalIncome,
      range: { fromDate: fromDate || null, toDate: toDate || null },
    });
  } catch (error) {
    next(error);
  }
};

const createMonthlyRate = async (req, res, next) => {
  try {
    const month = Number(req.body.month);
    const year = Number(req.body.year);
    const cowRate = Number(req.body.cowRate ?? 0);
    const buffaloRate = Number(req.body.buffaloRate ?? 0);
    const buyerId = req.body.buyerId && mongoose.Types.ObjectId.isValid(req.body.buyerId)
      ? new mongoose.Types.ObjectId(req.body.buyerId)
      : null;

    const baseFilter = { userId: req.user.id, month, year };
    let existingRate = null;

    if (buyerId) {
      existingRate = await MonthlyRate.findOne({ ...baseFilter, buyerId });
    } else {
      existingRate = await MonthlyRate.findOne({
        ...baseFilter,
        $or: [{ buyerId: null }, { buyerId: { $exists: false } }],
      });
    }

    if (existingRate) {
      const updatedRate = await MonthlyRate.findOneAndUpdate(
        { _id: existingRate._id },
        { $set: { buyerId, month, year, cowRate, buffaloRate } },
        { returnDocument: 'after', runValidators: true },
      );
      return res.status(200).json(updatedRate);
    }

    const createdRate = await MonthlyRate.create({
      userId: req.user.id,
      buyerId,
      month,
      year,
      cowRate,
      buffaloRate,
    });

    return res.status(201).json(createdRate);
  } catch (error) {
    if (error.code === 11000) {
      try {
        const fallbackRate = await MonthlyRate.findOne({ userId: req.user.id, month: Number(req.body.month), year: Number(req.body.year) });
        if (fallbackRate) {
          const updated = await MonthlyRate.findOneAndUpdate(
            { _id: fallbackRate._id },
            { $set: { cowRate: Number(req.body.cowRate ?? 0), buffaloRate: Number(req.body.buffaloRate ?? 0) } },
            { returnDocument: 'after', runValidators: true },
          );
          return res.status(200).json(updated);
        }
      } catch (innerError) {
        return next(innerError);
      }
    }
    next(error);
  }
};

const getMonthlyRates = async (req, res, next) => {
  try {
    const { buyerId } = req.query;
    const filter = { userId: req.user.id };

    if (buyerId && mongoose.Types.ObjectId.isValid(buyerId)) {
      filter.$or = [
        { buyerId: new mongoose.Types.ObjectId(buyerId) },
        { buyerId: null },
        { buyerId: { $exists: false } },
      ];
    } else {
      filter.$or = [{ buyerId: null }, { buyerId: { $exists: false } }];
    }

    const rates = await MonthlyRate.find(filter).sort({ year: -1, month: -1 });
    res.json(rates);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getMonthlyReport, createMonthlyRate, getMonthlyRates };
