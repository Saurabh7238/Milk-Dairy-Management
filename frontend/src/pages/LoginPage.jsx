import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'signup') {
        await signup(username, password, name, phone);
        toast.success('Account created');
      } else {
        await login(username, password);
        toast.success('Login successful');
      }
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || (mode === 'signup' ? 'Signup failed' : 'Login failed'));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#e0f2fe,_#f0fdf4)] p-4">
      <div className="w-full max-w-md rounded-[32px] border border-white/50 bg-white/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 w-fit rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 text-sm font-bold text-white">Milk Dairy Management System</div>
          <h1 className="text-3xl font-bold text-slate-900">{mode === 'signup' ? 'Create First Account' : 'Login'}</h1>
        </div>
        <div className="mb-4 flex gap-2 rounded-2xl bg-slate-100 p-1">
          <button type="button" onClick={() => setMode('login')} className={`flex-1 rounded-xl px-3 py-2 ${mode === 'login' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'}`}>Login</button>
          <button type="button" onClick={() => setMode('signup')} className={`flex-1 rounded-xl px-3 py-2 ${mode === 'signup' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'}`}>Sign Up</button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'signup' ? (
            <>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">Full Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" required />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">Phone</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" required />
              </label>
            </>
          ) : null}
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" required />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Password</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" required />
          </label>
          <button className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-3 font-semibold text-white shadow-lg">{mode === 'signup' ? 'Create Account' : 'Login'}</button>
          {mode === 'signup' ? <p className="text-center text-sm text-slate-500">The first account you create becomes the admin account.</p> : null}
        </form>
      </div>
    </div>
  );
}
