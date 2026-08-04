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

    const todayEntries = await MilkEntry.find({ userId: req.user.id, 
      date: {
        $gte: today.toDate(),
        $lt: today.add(1, 'day').toDate(),
      },
    });

    const monthlyEntries = await MilkEntry.find({ userId: req.user.id, 
      date: {
        $gte: monthStart,
        $lte: monthEnd,
      },
    });

    const monthlyCurd = await CurdEntry.find({ userId: req.user.id, 
      date: {
        $gte: monthStart,
        $lte: monthEnd,
      },
    });

    const weeklyEntries = await MilkEntry.find({ userId: req.user.id, 
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

    const rates = await MonthlyRate.findOne({ userId: req.user.id, month: dayjs().month() + 1, year: dayjs().year() });
    const cowRate = rates?.cowRate || 0;
    const buffaloRate = rates?.buffaloRate || 0;
    const milkIncome = monthlyEntries.reduce((sum, item) => sum + Number(item.cowTotal || 0) * cowRate + Number(item.buffaloTotal || 0) * buffaloRate, 0);

    res.json({
      today: {
        cowMilk: cowToday,
        buffaloMilk: buffaloToday,
        totalMilk: totalToday,
      },
      month: {
        totalMilk: monthMilkTotal,
        totalIncome: milkIncome,
        curdIncome,
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
    const { month, year, buyerId } = req.query;
    const monthNumber = Number(month);
    const yearNumber = Number(year);

    const monthStart = dayjs(`${yearNumber}-${monthNumber}-01`).startOf('month').toDate();
    const monthEnd = dayjs(`${yearNumber}-${monthNumber}-01`).endOf('month').toDate();

    const milkQuery = { userId: req.user.id, date: { $gte: monthStart, $lte: monthEnd } };
    const curdQuery = { userId: req.user.id, date: { $gte: monthStart, $lte: monthEnd } };

    if (buyerId && mongoose.Types.ObjectId.isValid(buyerId)) {
      milkQuery.buyerId = new mongoose.Types.ObjectId(buyerId);
      curdQuery.buyerId = new mongoose.Types.ObjectId(buyerId);
    }

    const milkEntries = await MilkEntry.find(milkQuery).sort({ date: 1 });
    const curdEntries = await CurdEntry.find(curdQuery);

    let monthlyRate = null;
    if (buyerId && mongoose.Types.ObjectId.isValid(buyerId)) {
      monthlyRate = await MonthlyRate.findOne({ userId: req.user.id, buyerId: new mongoose.Types.ObjectId(buyerId), month: monthNumber, year: yearNumber });
    }
    if (!monthlyRate) {
      monthlyRate = await MonthlyRate.findOne({ userId: req.user.id, buyerId: null, month: monthNumber, year: yearNumber });
    }

    const cowMilkTotal = milkEntries.reduce((sum, item) => sum + Number(item.cowTotal || 0), 0);
    const buffaloMilkTotal = milkEntries.reduce((sum, item) => sum + Number(item.buffaloTotal || 0), 0);
    const grandMilkTotal = cowMilkTotal + buffaloMilkTotal;
    const cowRate = monthlyRate?.cowRate || 0;
    const buffaloRate = monthlyRate?.buffaloRate || 0;
    const milkIncome = cowMilkTotal * cowRate + buffaloMilkTotal * buffaloRate;
    const curdIncome = curdEntries.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const finalIncome = milkIncome + curdIncome;

    res.json({
      monthName: dayjs(`${yearNumber}-${monthNumber}-01`).format('MMMM'),
      cowMilkTotal,
      buffaloMilkTotal,
      grandMilkTotal,
      cowRate,
      buffaloRate,
      milkIncome,
      curdIncome,
      finalIncome,
    });
  } catch (error) {
    next(error);
  }
};

const createMonthlyRate = async (req, res, next) => {
  try {
    const { month, year, cowRate, buffaloRate, buyerId } = req.body;
    const filter = { userId: req.user.id, month: Number(month), year: Number(year) };

    if (buyerId && mongoose.Types.ObjectId.isValid(buyerId)) {
      filter.buyerId = new mongoose.Types.ObjectId(buyerId);
    } else {
      filter.buyerId = null;
    }

    const rate = await MonthlyRate.findOneAndUpdate(
      filter,
      { $set: { userId: req.user.id, buyerId: filter.buyerId, month: Number(month), year: Number(year), cowRate, buffaloRate } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );

    res.status(201).json(rate);
  } catch (error) {
    if (error.code === 11000) {
      try {
        const filter = { userId: req.user.id, month: Number(req.body.month), year: Number(req.body.year) };
        if (req.body.buyerId && mongoose.Types.ObjectId.isValid(req.body.buyerId)) {
          filter.buyerId = new mongoose.Types.ObjectId(req.body.buyerId);
        } else {
          filter.buyerId = null;
        }

        const rate = await MonthlyRate.findOneAndUpdate(
          filter,
          { $set: { cowRate: req.body.cowRate, buffaloRate: req.body.buffaloRate } },
          { new: true, runValidators: true },
        );
        if (rate) return res.status(200).json(rate);
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
      filter.buyerId = new mongoose.Types.ObjectId(buyerId);
    } else {
      filter.buyerId = null;
    }

    const rates = await MonthlyRate.find(filter).sort({ year: -1, month: -1 });
    res.json(rates);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getMonthlyReport, createMonthlyRate, getMonthlyRates };
