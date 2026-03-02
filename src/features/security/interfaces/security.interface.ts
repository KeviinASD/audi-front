export interface LocalUserInfo {
    username: string;
    isAdmin: boolean;
    isEnabled: boolean;
    lastLogin: string | null;
    passwordNeverExpires: boolean;
}

export interface SecuritySnapshotResponse {
    id: number;
    capturedAt: string;

    // OS
    osName?: string;
    osVersion?: string;
    osBuild?: string;
    osArchitecture?: string;

    // Windows Update
    lastUpdateDate?: string;
    daysSinceLastUpdate?: number;
    pendingUpdatesCount: number;
    isCriticalUpdatePending: boolean;

    // Antivirus
    antivirusInstalled: boolean;
    antivirusEnabled: boolean;
    antivirusName?: string;
    antivirusVersion?: string;
    antivirusDefinitionsUpdated: boolean;
    antivirusLastScanDate?: string;

    // Firewall
    firewallEnabled: boolean;
    firewallDomainEnabled: boolean;
    firewallPrivateEnabled: boolean;
    firewallPublicEnabled: boolean;

    // Password Policy
    passwordMinLength?: number;
    passwordMaxAgeDays?: number;
    passwordMinAgeDays?: number;
    passwordComplexityEnabled: boolean;
    accountLockoutThreshold?: number;

    // Local Users
    localUsers?: LocalUserInfo[];

    // Last Login
    lastLoggedUser?: string;
    lastLoginDate?: string;
    currentLoggedUser?: string;

    // Flags
    uacEnabled: boolean;
    rdpEnabled: boolean;
    remoteRegistryEnabled: boolean;
    hasSecurityRisk: boolean;

    createdAt: string;
}

export interface SecurityRiskEquipmentResponse {
    id: number;
    code: string;
    name: string;
    ubication?: string;
    status: string;
    lastConnection?: string;
}
