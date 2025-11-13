"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setTokens, setUser } from '@/store/authSlice';
import { API_CONFIG } from '@/config/api';

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
      const loginResp = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!loginResp.ok) {
        const errorData = await loginResp.json().catch(() => ({}));
        setError(errorData.detail || errorData.error || 'Invalid credentials');
        return;
      }
      const loginData = await loginResp.json();
      const token = loginData.token;
      const user = loginData.user;
      
      if (token) {
        dispatch(setTokens({ access: token, refresh: token }));
      }
      if (user) {
        dispatch(setUser(user));
        // Redirect based on role
        if (user.role === 'admin') {
          router.push('/dashboard/admin');
        } else if (user.role === 'staff') {
          router.push('/dashboard/staff');
        } else if (user.role === 'driver') {
          router.push('/dashboard/driver');
        } else if (user.role === 'inspector') {
          router.push('/dashboard/inspector');
        } else {
          router.push('/dashboard');
        }
      } else {
        // Fallback: fetch user profile
        const meResp = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.ME}`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (meResp.ok) {
          const userData = await meResp.json();
          dispatch(setUser(userData));
          router.push('/dashboard');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check if the backend is running.');
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


