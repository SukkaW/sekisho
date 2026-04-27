'use client';

import { useRouter } from 'next/navigation';
import { createSession, useSetSession } from '../../lib/session';

export default function LoginPage() {
  const router = useRouter();

  const setSession = useSetSession();

  const handleLogin = (role: 'admin' | 'user') => {
    setSession(createSession(role));
    router.push('/');
  };

  return (
    <main>
      <h1>Login</h1>
      <p>Click below to create a fake in-memory session stored in <code>sessionStorage</code>.</p>
      <button type="button" onClick={() => handleLogin('admin')}>Login as Admin</button>
      <span style={{ margin: '0 8px' }} />
      <button type="button" onClick={() => handleLogin('user')}>Login as User</button>
    </main>
  );
}
