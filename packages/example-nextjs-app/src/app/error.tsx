'use client';

import { extractErrorMessage } from 'foxts/extract-error-message';
import { SekishoErrorWrapper } from 'sekisho';

interface ErrorPageProps {
  error: Error,
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <SekishoErrorWrapper error={error}>
      <div>
        <h1>Typical App Error Boundary: something went wrong</h1>
        <pre>
          <code>
            {extractErrorMessage(error, true, true)}
          </code>
        </pre>

        <p>
          This is the app's custom error boundary, and Sekisho does not interfere with it.
        </p>
        <button type="button" onClick={reset}>Clear Runtime Error</button>
      </div>
    </SekishoErrorWrapper>
  );
}
