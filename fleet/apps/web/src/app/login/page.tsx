"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setTokens, setUser } from '@/store/authSlice';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const loginResp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!loginResp.ok) {
        setError('Invalid credentials');
        return;
      }
      const { access, refresh } = await loginResp.json();
      dispatch(setTokens({ access, refresh }));
      const meResp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/me`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      const user = meResp.ok ? await meResp.json() : null;
      dispatch(setUser(user));
      router.push('/vehicles');
    } catch {
      setError('Network error');
    }
  };

  return (
    <div className="max-w-sm mx-auto p-8">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border p-2" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} />
        <input className="w-full border p-2" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="bg-black text-white px-4 py-2">Sign in</button>
      </form>
    </div>
  );
}


