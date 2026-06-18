import { useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { useAuthStore } from '../lib/store';
import { useRouter } from 'next/router';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const setUser = useAuthStore(s => s.setUser);
  const router = useRouter();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setUser({ name: form.name || form.email.split('@')[0], email: form.email, id: Date.now() });
    router.push('/profile');
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="bg-white p-10 w-full max-w-md">
          <div className="text-center mb-8">
            <span className="font-display text-3xl tracking-widest">ZELUX</span>
            <p className="text-xs text-gray-400 mt-2 tracking-wider">Your exclusive account</p>
          </div>
          <div className="flex border-b border-gray-100 mb-8">
            {['login','signup'].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 text-xs tracking-widest uppercase transition-colors ${tab === t ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}>
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>
          <div className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="text-xs text-gray-500 tracking-wider block mb-1">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors" />
              </div>
            )}
            <div>
              <label className="text-xs text-gray-500 tracking-wider block mb-1">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors" />
            </div>
            <div>
              <label className="text-xs text-gray-500 tracking-wider block mb-1">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors" />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button onClick={handleSubmit} className="w-full bg-black text-white py-4 text-xs tracking-widest uppercase hover:bg-yellow-500 hover:text-black transition-colors mt-2">
              {tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
