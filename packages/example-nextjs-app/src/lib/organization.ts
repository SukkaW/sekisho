import { createSekisho } from 'sekisho/factory';
import { createSessionStorageState } from 'foxact/create-session-storage-state';

// Custom sekisho guard for "organization required" scenarios
export const [
  requireOrganization,
  OrganizationRequiredContainer,
  OrganizationRequiredErrorWrapper,
  isOrganizationRequiredError,
  OrganizationRequiredError,
  useOrganizationRequiredReset
] = createSekisho('OrganizationRequiredError');

export type { SekishoFallbackComponentProps as OrganizationRequiredFallbackProps } from 'sekisho/factory';

const ORG_KEY = 'sekisho-demo-selected-org';

export interface Organization {
  id: string,
  name: string,
  plan: 'free' | 'pro' | 'enterprise',
  members: number,
  createdAt: string
}

export const ORGANIZATIONS: Organization[] = [
  { id: 'org_acme', name: 'Acme Corp', plan: 'enterprise', members: 142, createdAt: '2023-01-15' },
  { id: 'org_startup', name: 'Startup Inc', plan: 'pro', members: 12, createdAt: '2024-06-01' },
  { id: 'org_oss', name: 'OSS Foundation', plan: 'free', members: 38, createdAt: '2024-11-20' }
];

export const ORGANIZATION_MAP: Record<string, Organization> = ORGANIZATIONS.reduce<Record<string, Organization>>((acc, org) => {
  acc[org.id] = org;
  return acc;
}, {});

export interface OrgData {
  projects: Array<{ name: string, status: 'active' | 'archived' }>,
  apiCalls: number,
  storageUsedMb: number
}

const ORG_DATA: Record<string, OrgData> = {
  org_acme: {
    projects: [
      { name: 'Cloud Platform', status: 'active' },
      { name: 'Mobile App', status: 'active' },
      { name: 'Legacy API', status: 'archived' }
    ],
    apiCalls: 1_240_000,
    storageUsedMb: 8720
  },
  org_startup: {
    projects: [
      { name: 'MVP', status: 'active' },
      { name: 'Landing Page', status: 'active' }
    ],
    apiCalls: 45300,
    storageUsedMb: 320
  },
  org_oss: {
    projects: [
      { name: 'Core Library', status: 'active' },
      { name: 'Docs Site', status: 'active' },
      { name: 'Playground', status: 'active' },
      { name: 'Old Website', status: 'archived' }
    ],
    apiCalls: 180500,
    storageUsedMb: 1050
  }
};

export function getOrgData(orgId: string): OrgData | undefined {
  return ORG_DATA[orgId];
}

export const [useSelectedOrgState, useSelectedOrg, useSetSelectedOrg] = createSessionStorageState<string>(ORG_KEY, undefined);
