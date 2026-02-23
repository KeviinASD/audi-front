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

export interface CreateAuthorizedSoftwareRequest {
    name: string;
    publisher?: string;
    description?: string;
    laboratoryId?: number; // null = applies to all laboratories
}

export interface AuthorizedSoftwareResponse {
    id: number;
    name: string;
    publisher?: string;
    description?: string;
    laboratoryId?: number;
    createdAt: string;
}
