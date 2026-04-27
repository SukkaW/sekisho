'use client';

import { accessRestricted, needLogin, SekishoAccessContainer } from 'sekisho';
import { Suspense, useState } from 'react';
import { useSession, useSetSession } from '../lib/session';

function ThrowingComponent(): React.ReactNode {
  throw new Error('Simulated Runtime Error');
}

export default function HomePage() {
  const [shouldThrow, setShouldThrow] = useState(false);

  const setSession = useSetSession();

  return (
    <main>
      <h1>Dashboard</h1>

      <section>
        <h2>Session Details</h2>

        <Suspense fallback={<p>Reading session from sessionStorage...</p>}>
          <SeesionDetails />
        </Suspense>

        <button
          type="button"
          onClick={() => {
            // You only need to clear the seesion
            // It is the <SessionDetails /> that will notice session is missing
            // and call `needLogin()`, which will trigger `onNeedLogin`
            setSession(null);
          }}
        >
          Logout
        </button>
      </section>

      <hr />

      <section>
        <h2>Admin Panel</h2>
        <p>
          This section is only accessible to users with the <code>admin</code> role.

          The access control is powered by Sekisho's <code>accessRestricted()</code> function and <code>{'<SekishoAccessContainer />'}</code> component.
        </p>
        <Suspense fallback={<p>Reading session from sessionStorage...</p>}>
          <SekishoAccessContainer fallback={<p style={{ color: 'red' }}>You don't have admin access. Only admins can view this section.</p>}>
            <AdminSection />
          </SekishoAccessContainer>
        </Suspense>
      </section>

      <hr />

      <section>
        <h2>Error Boundary Demo</h2>
        <p>
          The button below renders a component that throws a plain <code>Error</code>.{' '}
          It is to demonstrate that Sekisho's error wrapper / error boundary won't interfere with your app's error handling.
        </p>
        {shouldThrow
          ? <ThrowingComponent />
          : <button type="button" onClick={() => setShouldThrow(true)}>Simulate Runtime Error</button>}
      </section>
    </main>
  );
}

function AdminSection() {
  const session = useSession();

  // Before hydration or no session — SeesionDetails handles the no-session case
  if (!session) return null;

  if (session.role !== 'admin') {
    accessRestricted('Admin only');
  }

  return (
    <p style={{ color: 'green' }}>
      You are logged in as <strong>admin</strong>. This content is only visible to admins.
    </p>
  );
}

function SeesionDetails() {
  const session = useSession();

  if (!session) {
    needLogin('No active session');
  }

  return (
    <dl>
      <dt>Session</dt>
      <dd><code>{session.session}</code></dd>
      <dt>Role</dt>
      <dd>{session.role}</dd>
      <dt>Login Time</dt>
      <dd>{new Date(session.loginTime).toLocaleString()}</dd>
    </dl>
  );
}
