import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import api from '../services/api';

const buildCalendarGrid = (year, month) => {
  const firstDay = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
  const startOfWeek = firstDay.startOf('week');
  const endOfMonth = firstDay.endOf('month');
  const endOfWeek = endOfMonth.endOf('week');
  const days = [];

  for (let current = startOfWeek.clone(); current.isBefore(endOfWeek) || current.isSame(endOfWeek, 'day'); current = current.add(1, 'day')) {
    days.push(current.clone());
  }

  return days;
};

export default function CalendarPage() {
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [events, setEvents] = useState({});
  const calendarDays = useMemo(() => buildCalendarGrid(year, month), [year, month]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const start = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).startOf('month').startOf('week');
        const end = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).endOf('month').endOf('week');

        const milkRes = await api.get('/milk', { params: { from: start.toISOString(), to: end.toISOString() } });

        const dayMap = {};
        const addEntry = (entry) => {
          const dateKey = dayjs(entry.date).startOf('day').format('YYYY-MM-DD');
          const existing = dayMap[dateKey] || { date: dateKey, milk: 0, entries: [] };
          existing.milk += Number(entry.cowTotal || 0) + Number(entry.buffaloTotal || 0);
          existing.entries.push({ ...entry });
          dayMap[dateKey] = existing;
        };

        (milkRes.data || []).forEach(addEntry);

        setEvents(dayMap);
      } catch (error) {
        console.error('Failed to load calendar events', error);
      }
    };
    loadEvents();
  }, [year, month]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/40 bg-white/60 p-5 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="mb-1 text-xl font-bold text-slate-900">Calendar View</h2>
            <p className="text-slate-700">Browse milk entries by day.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="rounded-2xl border px-4 py-3">
              {[...Array(12)].map((_, index) => (
                <option key={index + 1} value={index + 1}>{dayjs().month(index).format('MMMM')}</option>
              ))}
            </select>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-32 rounded-2xl border px-4 py-3" />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/40 bg-white/60 p-5 shadow-lg">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {calendarDays.map((day) => {
            const key = day.format('YYYY-MM-DD');
            const event = events[key];
            const isCurrentMonth = day.month() + 1 === month;
            return (
              <div key={key} className={`min-h-[110px] rounded-3xl border p-3 text-left ${isCurrentMonth ? 'bg-white' : 'bg-slate-50 text-slate-400'} ${event ? 'border-sky-500 bg-sky-50' : 'border-slate-200'}`}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold">{day.date()}</span>
                  {event && <span className="rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-bold text-white">{event.milk > 0 ? 'M' : ''}</span>}
                </div>
                {event ? (
                  <div className="space-y-1 text-xs text-slate-700">
                    {event.milk > 0 && <div>Milk: {event.milk.toFixed(2)} kg</div>}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">No entries</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
