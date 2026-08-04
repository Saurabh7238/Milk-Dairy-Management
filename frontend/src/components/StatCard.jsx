export default function StatCard({ title, value, icon: Icon, accent = 'from-emerald-500 to-sky-500' }) {
  return (
    <div className="rounded-3xl border border-white/40 bg-white/60 p-4 shadow-lg backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">{title}</span>
        <div className={`rounded-2xl bg-gradient-to-r ${accent} p-3 text-white`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
