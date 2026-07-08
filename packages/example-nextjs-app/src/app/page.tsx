'use client';

import { accessRestricted, needLogin, AccessRestrictedContainer, useAccessRestrictedReset } from 'sekisho';
import type { AccessRestrictedFallbackProps } from 'sekisho';
import { Suspense, useState } from 'react';
import { createSession, useSession, useSetSession } from '../lib/session';
import {
  requireOrganization,
  OrganizationRequiredContainer,
  ORGANIZATIONS,
  getOrgData,
  useSelectedOrg,
  useSetSelectedOrg,
  ORGANIZATION_MAP
} from '../lib/organization';
import type { OrganizationRequiredFallbackProps } from '../lib/organization';

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

          The access control is powered by Sekisho's <code>accessRestricted()</code> function and <code>{'<AccessRestrictedContainer />'}</code> component.
        </p>
        <Suspense fallback={<p>Reading session from sessionStorage...</p>}>
          <AccessRestrictedContainer fallbackComponent={AccessRestrictedFallback}>
            <AdminSection />
          </AccessRestrictedContainer>
        </Suspense>
      </section>

      <hr />

      <section>
        <h2>Organization Dashboard</h2>
        <p>
          This section demonstrates a <strong>custom sekisho guard</strong> built with <code>createSekisho()</code> from <code>sekisho/factory</code>.
          {' '}The organization data below requires an org to be selected — otherwise the guard fires and the fallback is shown.
        </p>

        <Suspense fallback={<p>Loading organization data...</p>}>
          <OrgSection />
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

      <hr />

      <p>
        <a href="https://github.com/SukkaW/sekisho" target="_blank" rel="noreferrer">GitHub</a>
        {' · '}
        <code>npm install sekisho</code>
      </p>
    </main>
  );
}

function AccessRestrictedFallback({ error, reset }: AccessRestrictedFallbackProps) {
  return (
    <div>
      <p style={{ color: 'red' }}>
        You don't have admin access. Only admins can view this section. (<code>{error.message}</code>)
      </p>
      {/* `reset` re-renders the children; the guard still fails, so the fallback re-appears */}
      <button type="button" onClick={reset}>Re-check access</button>
      {' '}
      <ElevateToAdminButton />
    </div>
  );
}

// Demonstrates resetting via the hook, from a component nested inside the fallback
function ElevateToAdminButton() {
  const reset = useAccessRestrictedReset();
  const setSession = useSetSession();

  return (
    <button
      type="button"
      onClick={() => {
        setSession(createSession('admin'));
        reset();
      }}
    >
      Elevate to admin & re-check
    </button>
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

function OrgSection() {
  const selectedOrg = useSelectedOrg();

  return (
    <>
      <OrgSelector />
      <OrganizationRequiredContainer key={selectedOrg ?? '__none__'} fallbackComponent={OrgRequiredFallback}>
        <OrgDashboard />
      </OrganizationRequiredContainer>
    </>
  );
}

function OrgSelector() {
  const selectedOrg = useSelectedOrg();
  const setSelectedOrg = useSetSelectedOrg();

  return (
    <div style={{ margin: '0.75rem 0' }}>
      <label htmlFor="org-select" style={{ fontWeight: 600, marginRight: '0.5rem' }}>
        Select organization:
      </label>
      <select
        id="org-select"
        value={selectedOrg ?? ''}
        onChange={(e) => {
          const value = e.target.value;
          setSelectedOrg(value || null);
        }}
      >
        <option value="">-- None --</option>
        {ORGANIZATIONS.map((org) => (
          <option key={org.id} value={org.id}>{org.name}</option>
        ))}
      </select>
    </div>
  );
}

function OrgRequiredFallback({ error }: OrganizationRequiredFallbackProps) {
  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: 4, background: '#fafafa', marginTop: '0.75rem' }}>
      <p style={{ margin: 0, color: '#888' }}>
        <code>{'<OrgRequiredFallback />'}</code>
        <br />
        <br />
        {error.message}
      </p>
    </div>
  );
}

function OrgDashboard() {
  const selectedOrg = useSelectedOrg();

  if (!selectedOrg) {
    return requireOrganization('No organization is selected');
  }

  if (!(selectedOrg in ORGANIZATION_MAP)) {
    return requireOrganization(`Selected organization "${selectedOrg}" is not found`);
  }

  const org = ORGANIZATION_MAP[selectedOrg];
  const data = getOrgData(org.id);
  if (!data) {
    return requireOrganization(`Selected organization "${selectedOrg}" is not found`);
  }

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <dl>
        <dt>Organization</dt>
        <dd><strong>{org.name}</strong></dd>
        <dt>Plan</dt>
        <dd>{org.plan}</dd>
        <dt>Members</dt>
        <dd>{org.members}</dd>
        <dt>Created</dt>
        <dd>{org.createdAt}</dd>
        <dt>API Calls</dt>
        <dd>{data.apiCalls.toLocaleString()}</dd>
        <dt>Storage</dt>
        <dd>{data.storageUsedMb.toLocaleString()} MB</dd>
      </dl>
      <h3 style={{ fontSize: '1rem', margin: '1rem 0 0.5rem' }}>Projects</h3>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        {data.projects.map((p) => (
          <li key={p.name}>
            {p.name} <span style={{ color: p.status === 'active' ? 'green' : '#999', fontSize: '0.85em' }}>({p.status})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
