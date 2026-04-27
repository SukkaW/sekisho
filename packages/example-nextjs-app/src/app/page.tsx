'use client';

import { needLogin } from 'sekisho';
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

function SeesionDetails() {
  const session = useSession();

  if (!session) {
    needLogin('No active session');
  }

  return (
    <dl>
      <dt>Session</dt>
      <dd><code>{session.session}</code></dd>
      <dt>Login Time</dt>
      <dd>{new Date(session.loginTime).toLocaleString()}</dd>
    </dl>
  );
}
