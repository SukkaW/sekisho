<h1 align="center">⛩️ sekisho</h1>
<p align="center"><sup>(関所, <em>historical checkpoint for travel and security</em> in Japanese)</sup></p>
<p align="center">Authentication and Access Control for any React app <a href="https://sekisho-demo.pages.dev" target="_blank">online demo</a></p>

----

## Usage

### Full example

See the [example-nextjs-app](../../packages/example-nextjs-app). This example is deployed online at [https://sekisho-demo.pages.dev](https://sekisho-demo.pages.dev).

### Login Redirects for Unauthenticated Users

Use `NotAuthenticatedContainer` to handle login redirects in a way that works with your framework's routing constraints.

**Wrap your protected routes/content with `NotAuthenticatedContainer`**

```tsx
'use client';

import { NotAuthenticatedContainer } from 'sekisho';

function LoginRedirect() {
  // perform your redirect logic here, e.g. using your framework's router
  // for example, in Next.js App Router:
  return redirect('/login');

  // in React Router:
  const navigate = useNavigate();
  useEffect(() => { navigate('/login'); }, [navigate]);
  return null;
  // or
  return <Navigate to="/login" />;

  // Wouter
  return <Redirect to="/login" />;
}

export function Protected() {
  return (
    <NotAuthenticatedContainer
      // you can pass a React element directly as fallback
      fallback={<LoginRedirect />}
      // or you can pass a component that receives the error object as prop
      fallbackComponent={LoginRedirect}
    >
      {/* Protected content goes here */}
    </NotAuthenticatedContainer>
  );
}
```

**Trigger a login redirect**

Call `needLogin()` anywhere during the React render phase. You can call `needLogin()` in a client component (e.g. when session state is absent):

```tsx
import { needLogin } from 'sekisho';

function Dashboard() {
  const session = useAuthSession();

  if (!session) {
    needLogin('No active session');
  }

  return <div>Welcome, {session.username}</div>;
}
```

...or you can call `needLogin()` in a [SWR](https://swr.vercel.app) middleware (e.g. when an API response carries a known auth error):

```tsx
import { needLogin } from 'sekisho';
import type { Middleware } from 'swr';

export const requireAuthMiddleware: Middleware = (useSWRNext) => (key, fetcher, config) => {
  const swr = useSWRNext(key, fetcher, config);
  if (swr.error && isApiAuthError(swr.error)) {
    needLogin(swr.error.message);
  }
  return swr;
};
```

> Right now, you can't call `needLogin()` within an event handler or `useEffect`, because it won't be caught by the React error boundary mechanism. We may be able to implement this in a future version.

This kinda like `<Suspense />` but for login redirects instead. And like `<Suspense />`, you can have multiple `NotAuthenticatedContainer`s nested independently — each one only catches the `needLogin()` calls within its own subtree.

**Set up with Next.js App Router**

You may use Next.js [Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) to create protected and unprotected sections of your app:

```
app/
├── (protected)/            ← all protected routes goes under here
│   ├── layout.tsx          ← wrap with <NotAuthenticatedContainer> here
│   ├── error.tsx           ← wrap with <NotAuthenticatedErrorWrapper> if you are using error.tsx file convention
│   └── page.tsx            ← homepage, where you call needLogin() when authentication is needed
│
├── (unprotected)/          ← all unprotected routes goes under here
│   └── login/
│       └── page.tsx
│
└── layout.tsx              ← your root layout with <html /> and <body />
```

```tsx
// app/(protected)/layout.tsx
import { NotAuthenticatedContainer } from 'sekisho';
import { redirect } from 'next/navigation';

function LoginRedirect(): never {
  return redirect('/login');
}

export function ProtectedLayout({ children }: React.PropsWithChildren) {
  return (
    <NotAuthenticatedContainer fallback={<LoginRedirect />}>
      {children}
    </NotAuthenticatedContainer>
  );
}
```

> [!NOTE]
> If you are using `<NotAuthenticatedContainer />` in a `layout.tsx` file, and if you are using `error.tsx` file convention, you will need to wrap your `error.tsx` with `NotAuthenticatedErrorWrapper` due to Next.js layout, page, and error boundary hierarchy.
>
> ```tsx
> // app/error.tsx
> 'use client';
>
> import { NotAuthenticatedErrorWrapper } from 'sekisho';
>
> export default function ErrorPage({ error, reset }) {
>   return (
>     <NotAuthenticatedErrorWrapper error={error}>
>       {/* Your existing error UI goes in here */}
>     </NotAuthenticatedErrorWrapper>
>   );
> }
> ```

**Set up with React Router**

```tsx
import { NotAuthenticatedContainer } from 'sekisho';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // protected routes goes here
      {
        element: <Protected />,
        children: [
          /* protected routes goes here */
          { path: '/admin', element: <Dashboard /> }
        ]
      },
      // unprotected routes goes here
      { path: '/login', element: <LoginPage /> }
    ]
  }
]);

function Protected() {
  return (
    <NotAuthenticatedContainer fallback={<Navigate to="/login" />}>
      <Outlet />
    </NotAuthenticatedContainer>
  );
}
```

> [!NOTE]
> If you are using React Router's `errorElement` convention, you may need to wrap your `errorElement` with `NotAuthenticatedErrorWrapper`:
>
> ```tsx
> {
>   errorElement: <ErrorComponent />
> }
>
> function ErrorComponent() {
>   const error = useRouteError();
>   return (
>     <NotAuthenticatedErrorWrapper error={error}>
>       {/* Your existing error UI goes in here */}
>     </NotAuthenticatedErrorWrapper>
>   );
> }
> ```

### Restricting Access to Part of the UI

Wrap any part of the UI with `AccessRestrictedContainer` and call `accessRestricted()` inside it when the user lacks the required role or permission. Unlike `needLogin()`, which triggers a global redirect via `onNeedLogin`, `accessRestricted()` is local — `AccessRestrictedContainer` simply renders `fallback` in place of its children:

```tsx
import { accessRestricted, AccessRestrictedContainer } from 'sekisho';

function AdminPanel() {
  const { role } = useCurrentUser();

  if (role !== 'admin') {
    accessRestricted('Admin only');
  }

  return <div>Secret admin content</div>;
}

function AccessRestricted() {
  // you may render a fallback UI in place of the restricted content
  return <p>You don't have permission to view this section.</p>

  // or you may just redirect your user away
  return redirect('/forbidden');
}

function Page() {
  return (
    <AccessRestrictedContainer
      fallback={<AccessRestricted />}
      // or you can pass a component that receives the error object as prop
      fallbackComponent={AccessRestricted}
    >
      <AdminPanel />
    </AccessRestrictedContainer>
  );
}
```

This kinda like `<Suspense />` but for access control instead. And like `<Suspense />`, you can have multiple `AccessRestrictedContainer`s nested independently — each one only catches the `accessRestricted()` calls within its own subtree.

## Explanation

Sekisho is built on top of React's error boundaries. Both `needLogin()` and `accessRestricted()` throw a special tagged error during the React render phase, which bubbles up to the nearest matching boundary. Each boundary re-throws errors it does not own, so your own error boundaries are unaffected.

## Build Your Own Custom Gate

Sekisho also provides a low-level abstraction `createSekisho` from `sekisho/factory` for building your own custom gate with the same underlying mechanism. Let's say you want to build a guard for new user onboarding flow, where users need to complete their profile before accessing certain parts of the app:

```tsx
import { createSekisho } from 'sekisho/factory';
import { redirect } from 'next/navigation';

const [requireOnboarding, OnboardingGate, OnboardingErrorWrapper] = createSekisho('OnboardingRequired');

function OnboardingRedirect(): never {
  redirect('/onboarding');
}

function Protected({ children }: React.PropsWithChildren) {
  return (
    <OnboardingGate fallback={<OnboardingRedirect />}>
      {/* actual content goes here */}
      <Dashboard />
    </OnboardingGate>
  );
}

function Dashboard() {
  const user = useUser();

  if (!user.profileComplete) {
    requireOnboarding('Profile incomplete');
  }

  return <div>Welcome back, {user.name}</div>;
}
```

The `createSekisho()` factory returns a 5-tuple so each element can be named freely on destructure:
`[throwFn, ContainerComponent, ErrorWrapper, isError, ErrorClass]`

- **`throwFn`** — Call this during render to trigger the guard when a condition is unmet
- **`ContainerComponent`** — Error boundary that catches errors thrown by `throwFn`. Accepts `fallback` (static UI) or `fallbackComponent` (component that receives `{ error }`). Stores the options in context for `ErrorWrapper` to reuse.
- **`ErrorWrapper`** — Companion for framework error boundaries (Next.js `error.tsx`, React Router `errorElement`, etc.). Reads `fallback`/`fallbackComponent` from the nearest `ContainerComponent` ancestor in context.
- **`isError`** — Type guard to check if an error is from this guard (useful in middleware or error handlers)
- **`ErrorClass`** — The error constructor

Each call to `createSekisho()` is isolated — guards never accidentally catch each other's errors, even if nested.

## License

[MIT](LICENSE)

----

**sekisho** © [Sukka](https://github.com/SukkaW), Released under the [MIT](./LICENSE) License.
Authored and maintained by Sukka with help from contributors ([list](https://github.com/SukkaW/sekisho/graphs/contributors)).

> [Personal Website](https://skk.moe) · [Blog](https://blog.skk.moe) · GitHub [@SukkaW](https://github.com/SukkaW) · Telegram Channel [@SukkaChannel](https://t.me/SukkaChannel) · Mastodon [@sukka@acg.mn](https://acg.mn/@sukka) · Twitter [@isukkaw](https://twitter.com/isukkaw) · BlueSky [@skk.moe](https://bsky.app/profile/skk.moe)

<p align="center">
  <a href="https://github.com/sponsors/SukkaW/">
    <img src="https://sponsor.cdn.skk.moe/sponsors.svg"/>
  </a>
</p>
