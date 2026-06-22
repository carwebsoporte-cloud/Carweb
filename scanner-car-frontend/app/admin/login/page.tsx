'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin, saveToken } from '@/lib/admin';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = await adminLogin(username.trim(), password);
      saveToken(token);
      router.push('/admin');
    } catch {
      setError('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 cw-grid cw-grid-fade opacity-30" />
      <div className="absolute inset-0 cw-radial" />

      <form
        onSubmit={onSubmit}
        className="relative glass-strong rounded-2xl p-8 w-full max-w-sm"
      >
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#00a3c4] flex items-center justify-center glow-neon">
            <svg className="w-5 h-5 text-[#020617]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="leading-none">
            <p className="text-lg font-extrabold text-white">CAR<span className="text-neon">WEB</span></p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Panel Admin</p>
          </div>
        </div>

        <h1 className="text-xl font-bold text-white mb-1">Iniciar sesión</h1>
        <p className="text-slate-400 text-sm mb-6">Acceso restringido al administrador.</p>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-crit/10 border border-crit/30 text-crit text-sm">
            {error}
          </div>
        )}

        <label className="block text-sm text-slate-300 mb-1">Usuario</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          className="w-full mb-4 px-4 py-3 bg-[#040a18]/80 text-white rounded-xl border border-white/10 focus:border-neon focus:outline-none placeholder-slate-600"
          placeholder="admin"
          required
        />

        <label className="block text-sm text-slate-300 mb-1">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full mb-6 px-4 py-3 bg-[#040a18]/80 text-white rounded-xl border border-white/10 focus:border-neon focus:outline-none placeholder-slate-600"
          placeholder="••••••••"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-[#00d4ff] to-[#00a3c4] text-[#020617] font-bold rounded-xl hover:shadow-lg hover:shadow-[#00d4ff]/30 transition-all disabled:opacity-60"
        >
          {loading ? 'Verificando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
