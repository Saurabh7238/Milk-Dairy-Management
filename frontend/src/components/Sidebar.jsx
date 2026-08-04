import { NavLink } from 'react-router-dom';
import { FiHome, FiFileText, FiCoffee, FiDollarSign, FiCalendar, FiSettings, FiLogOut, FiUsers } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Dashboard', icon: FiHome },
  { to: '/milk', label: 'Milk Entry', icon: FiCoffee },
  { to: '/report', label: 'Monthly Report', icon: FiFileText },
  { to: '/buyers', label: 'Buyers', icon: FiUsers },
  { to: '/sales', label: 'Sell Milk', icon: FiDollarSign },
  { to: '/calendar', label: 'Calendar', icon: FiCalendar },
  { to: '/settings', label: 'Settings', icon: FiSettings },
];

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="flex w-full flex-col justify-between rounded-3xl border border-white/40 bg-white/40 p-4 shadow-xl backdrop-blur-xl md:w-72">
      <div>
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 p-4 text-white shadow-lg">
          <div className="text-xs uppercase tracking-[0.4em] text-white/80">Admin</div>
          <div className="mt-2 text-2xl font-bold">Milk Dairy</div>
        </div>
        <nav className="space-y-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 transition ${isActive ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-700 hover:bg-white/60'}`
              }
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <button onClick={logout} className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
        <FiLogOut />
        Logout
      </button>
    </aside>
  );
}
