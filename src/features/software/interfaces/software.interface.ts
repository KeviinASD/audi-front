export const LicenseStatus = {
    LICENSED:   'licensed',
    UNLICENSED: 'unlicensed',
    UNKNOWN:    'unknown',
} as const;

export type LicenseStatus = typeof LicenseStatus[keyof typeof LicenseStatus];

export interface SoftwareInstalledResponse {
    id: number;
    name: string;
    version?: string;
    publisher?: string;
    installedAt?: string;
    capturedAt: string;
    licenseStatus: LicenseStatus;
    isWhitelisted: boolean;
    isRisk: boolean;
    createdAt: string;
}

export interface SnapshotHistoryEntry {
    capturedAt: string;
    totalItems: number;
    riskyCount: number;
    unlicensedCount: number;
    items: SoftwareInstalledResponse[];
}

export interface CreateAuthorizedSoftwareRequest {
    name: string;
    publisher?: string;
    description?: string;
    laboratoryId?: number;
}

export interface AuthorizedSoftwareResponse {
    id: number;
    name: string;
    publisher?: string;
    description?: string;
    laboratoryId?: number;
    createdAt: string;
}
