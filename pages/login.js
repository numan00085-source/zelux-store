import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuthStore } from '../lib/store';
import { useRouter } from 'next/router';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore(s => s.setUser);
  const user = useAuthStore(s => s.user);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const dest = typeof router.query.redirect === 'string' ? router.query.redirect : '/profile';
      router.push(dest);
    }
  }, [user]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const finalName = form.name || form.email.split('@')[0];
    fetch('/api/register-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, name: finalName }),
    }).catch(() => {}); // Don't block login if this fails

    setTimeout(() => {
      setUser({ name: finalName, email: form.email, id: Date.now() });
      const dest = typeof router.query.redirect === 'string' ? router.query.redirect : '/profile';
      router.push(dest);
    }, 400);
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen flex items-center justify-center px-4 bg-zelux-navy relative overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-zelux-cyan/8 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-zelux-cyan/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>

        <div className="bg-zelux-navy-card border border-zelux-gray-mid/30 rounded-2xl p-10 w-full max-w-md relative z-10 animate-scale-in shadow-glow-sm">
          <div className="text-center mb-8">
            <span className="font-display text-3xl tracking-widest text-zelux-white glow-text">ZELUX</span>
            <p className="text-xs text-zelux-gray mt-2 tracking-wider">Your exclusive account</p>
          </div>
          <div className="flex border-b border-zelux-gray-mid/30 mb-8">
            {['login','signup'].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 text-xs tracking-widest uppercase transition-colors duration-300 ${tab === t ? 'border-b-2 border-zelux-cyan text-zelux-cyan' : 'text-zelux-gray hover:text-zelux-white'}`}>
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>
          <div className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="text-xs text-zelux-gray tracking-wider block mb-1.5">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full bg-zelux-navy-light border border-zelux-gray-mid/40 rounded-lg px-4 py-3 text-sm text-zelux-white outline-none focus:border-zelux-cyan transition-colors duration-300" />
              </div>
            )}
            <div>
              <label className="text-xs text-zelux-gray tracking-wider block mb-1.5">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full bg-zelux-navy-light border border-zelux-gray-mid/40 rounded-lg px-4 py-3 text-sm text-zelux-white outline-none focus:border-zelux-cyan transition-colors duration-300" />
            </div>
            <div>
              <label className="text-xs text-zelux-gray tracking-wider block mb-1.5">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} onKeyDown={e => e.key === 'Enter' && handleSubmit()} className="w-full bg-zelux-navy-light border border-zelux-gray-mid/40 rounded-lg px-4 py-3 text-sm text-zelux-white outline-none focus:border-zelux-cyan transition-colors duration-300" />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button onClick={handleSubmit} disabled={loading} className="btn-glow w-full bg-zelux-cyan text-zelux-navy py-3.5 text-xs tracking-widest uppercase font-semibold rounded-full hover:shadow-glow-lg hover:scale-[1.02] transition-all duration-300 mt-2 disabled:opacity-60">
              {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
