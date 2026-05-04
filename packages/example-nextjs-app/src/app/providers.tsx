'use client';

import { NotAuthenticatedContainer } from 'sekisho';
import { redirect } from 'next/navigation';

// Fallback component that handles login redirect in render phase
function LoginRedirect() {
  return redirect('/login');

  // If you are using React Router, you can do this instead:
  //
  // const navigate = useNavigate();
  // useEffect(() => { navigate('/login'); }, [navigate]);
  // return null;
}

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <NotAuthenticatedContainer fallbackComponent={LoginRedirect}>
      {children}
    </NotAuthenticatedContainer>
  );
}
