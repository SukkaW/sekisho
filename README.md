<h1 align="center">⛩️ sekisho</h1>
<p align="center"><sup>(関所, <em>historical checkpoint for travel and security</em> in Japanese)</sup></p>
<p align="center">Authentication and Access Control for any React app</p>

----

## Usage

### Full example

See the [example-nextjs-app](../../packages/example-nextjs-app).

### Simple setup

Wrap your app with `SekishoProvider` with options:

```tsx
// app/providers.tsx

// here we create a dedicated file, as we want to make this file a client component in Next.js App Router
//
// if you don't use the Next.js App Router, you can just wrap your app's entrypoint with `SekishoProvider`
// directly without creating a separate file

'use client';

import { SekishoProvider } from 'sekisho';
import { useRouter } from 'next/navigation';

export function Providers({ children }: React.PropsWithChildren) {
  const router = useRouter();

  return (
    <SekishoProvider
      onNeedLogin={() => {
        // Tell Sekisho what to do when the authentication is required.
        router.push('/login');
        // Sekisho can work with any router or navigation library.
        // You can also call `navigate` from React Router's `useNavigate` here:
        // navigate('/login');
      }}
    >
      {children}
    </SekishoProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

By default, `SekishoProvider` already includes `SekishoErrorBoundary` that will catch any `NotAuthenticatedError` thrown by `needLogin()` in the subtree. But if you have special error handling needs in certain parts of your app, you can also always import `SekishoErrorBoundary` directly to wrap those parts:

```tsx
import { SekishoErrorBoundary } from 'sekisho';

function SomePartOfApp() {
  return (
    <SekishoErrorBoundary>
      {/* ... */}
    </SekishoErrorBoundary>
  );
}
```

And if you are using Next.js App Router and `error.tsx` file, due to Next.js layout, page, and error boundary heirarchy, you will also need to wrap the `error.tsx` with `SekishoErrorWrapper`:

```tsx
// app/error.tsx
'use client';

import { SekishoErrorWrapper } from 'sekisho';

export default function ErrorPage({ error, reset }) {
  return (
    <SekishoErrorWrapper error={error}>
      {/* Your existing error UI goes in here */}
    </SekishoErrorWrapper>
  );
}
```

> `SekishoErrorWrapper` is actually used by `SekishoErrorBoundary` internally, containing all the core logic.

### Triggering a login redirect

Call `needLogin()` anywhere during the React render phase.

Right now, you can't call `needLogin()` within an event handler or `useEffect`, because it won't be caught by the React error boundary mechanism. We will be implementing this in a future version.

**In a client component** (e.g. when session state is absent):

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

**In a [SWR](https://swr.vercel.app) middleware** (e.g. when an API response carries a known auth error):

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

## Explanation

Sekisho is built on top of React's error boundaries. When you call `needLogin()` within the React render phase, it throws a special `NotAuthenticatedError`. React will then bubble the error up to the nearest React error boundary, and that's when Sekisho's error boundary went into action: it checks if the error is a `NotAuthenticatedError`, and if so, it calls the `onNeedLogin` callback you provided to `SekishoProvider`, and re-throws the error if it is not.

This way, you can centralize your authentication logic and keep it separate from your UI components.

Also, with the `SekishoErrorWrapper` / `SekishoErrorBoundary`, you can create protected routes and unprotected routes more easily with any React apps:

**Next.js App Router**

```
app/
├── (protected)/            ← all protected routes goes under here
│   ├── layout.tsx          ← wrap children with <SekishoProvider> here
│   ├── error.tsx           ← wrap with <SekishoErrorWrapper> here
│   └── page.tsx            ← homepage, where you call needLogin() when authentication is needed
├── (unprotected)/          ← all unprotected routes goes under here
│   └── login/
│       └── page.tsx
└── layout.tsx              ← root layout
```

**React Router**

```tsx
const router = createBrowserRouter([
  {
    component() {
      return (
        <RootLayout>
          <SekishoProvider onNeedLogin={() => navigate('/login')}>
            <Outlet />
          </SekishoProvider>
        </RootLayout>
      );
    },
    children: [
      {
        component() {
          return (
            <SekishoErrorBoundary>
              <Outlet />
            </SekishoErrorBoundary>
          );
        },
        children: [
          // protected routes goes here
        ]
      },
      // unprotected routes goes here
    ]
  }
]);
```

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
