import { useEffect, useState } from 'react';
import { FaCow, FaWater, FaIndianRupeeSign, FaCalendarDay } from 'react-icons/fa6';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../services/api';
import StatCard from '../components/StatCard';
import dayjs from 'dayjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyers, setBuyers] = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [buyersRes, dashRes] = await Promise.all([
          api.get('/buyers'),
          api.get(`/dashboard${selectedBuyer ? `?buyerId=${selectedBuyer}` : ''}`),
        ]);
        const buyerList = buyersRes.data || [];
        setBuyers(buyerList);
        if (!selectedBuyer && buyerList.length === 1) {
          setSelectedBuyer(buyerList[0]._id);
        }
        setDashboard(dashRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [selectedBuyer]);

  if (loading) return <div className="rounded-3xl bg-white/70 p-6 text-slate-700">Loading dashboard...</div>;

  const monthlyLineData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      { label: 'Milk (kg)', data: dashboard?.charts?.monthly || [0, 0, 0, 0], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.2)' },
    ],
  };

  const barData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { label: 'Milk', data: dashboard?.charts?.weekly || [0, 0, 0, 0, 0, 0, 0], backgroundColor: '#38bdf8' },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Today's Cow Milk" value={`${dashboard?.today?.cowMilk ?? 0} kg`} icon={FaCow} accent="from-emerald-500 to-sky-500" />
        <StatCard title="Today's Buffalo Milk" value={`${dashboard?.today?.buffaloMilk ?? 0} kg`} icon={FaWater} accent="from-sky-500 to-cyan-500" />
        <StatCard title="Today's Total Milk" value={`${dashboard?.today?.totalMilk ?? 0} kg`} icon={FaCalendarDay} accent="from-green-500 to-lime-500" />
        <StatCard title="Current Month Total Milk" value={`${dashboard?.month?.totalMilk ?? 0} kg`} icon={FaCow} accent="from-emerald-500 to-teal-500" />
        <StatCard title="Current Month Cow Rate" value={`₹${dashboard?.monthlyRates?.cowRate ?? 0} /kg`} icon={FaIndianRupeeSign} accent="from-sky-500 to-blue-600" />
        <StatCard title="Current Month Buffalo Rate" value={`₹${dashboard?.monthlyRates?.buffaloRate ?? 0} /kg`} icon={FaIndianRupeeSign} accent="from-sky-500 to-blue-600" />
        <StatCard title="Current Month Milk Income" value={`₹${dashboard?.month?.milkIncome ?? 0}`} icon={FaIndianRupeeSign} accent="from-sky-500 to-blue-600" />
        <StatCard title="Current Month Total Income" value={`₹${dashboard?.month?.totalIncome ?? 0}`} icon={FaIndianRupeeSign} accent="from-indigo-500 to-cyan-500" />
      </div>
      {dashboard?.monthlyRates == null && dashboard?.month?.totalMilk > 0 && (
        <div className="rounded-3xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
          No current monthly rate is defined yet. Milk income is calculated from entry amounts when rates are unavailable, so it may appear as zero until rates are set in the Monthly Report page.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/40 bg-white/60 p-5 shadow-lg">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Monthly Graph</h3>
          <Line data={monthlyLineData} />
        </div>
        <div className="rounded-3xl border border-white/40 bg-white/60 p-5 shadow-lg">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Weekly Graph</h3>
          <Bar data={barData} />
        </div>
      </div>

      <div className="rounded-3xl border border-white/40 bg-white/60 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">Today's Summary</h3>
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-600">Filter by buyer:</label>
              <select value={selectedBuyer} onChange={(e) => setSelectedBuyer(e.target.value)} className="rounded-2xl border px-3 py-2 text-sm">
                <option value="">All buyers</option>
                {buyers.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
        <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50 p-4 text-sm">Date: {dayjs().format('DD MMM YYYY')}</div>
            <div className="rounded-2xl bg-sky-50 p-4 text-sm">Cow Milk: {(dashboard?.today?.cowMilk ?? 0).toFixed(2)} kg</div>
            <div className="rounded-2xl bg-indigo-50 p-4 text-sm">Buffalo Milk: {(dashboard?.today?.buffaloMilk ?? 0).toFixed(2)} kg</div>
        </div>
      </div>
    </div>
  );
}
