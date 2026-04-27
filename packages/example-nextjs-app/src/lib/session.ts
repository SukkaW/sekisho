import { v4 as uuidv4 } from '@lukeed/uuid';
import { createSessionStorageState } from 'foxact/create-session-storage-state';

const SESSION_KEY = 'sekisho-demo-session';

export interface Session {
  session: string,
  role: 'admin' | 'user',
  loginTime: string
}

export const [useSessionState, useSession, useSetSession] = createSessionStorageState<Session>(SESSION_KEY, undefined);

export function createSession(role: 'admin' | 'user'): Session {
  return { session: uuidv4(), role, loginTime: new Date().toISOString() };
}
