export const DiskSmartStatus = {
    GOOD:    'good',
    WARNING: 'warning',
    FAILED:  'failed',
    UNKNOWN: 'unknown',
} as const;

export type DiskSmartStatus = typeof DiskSmartStatus[keyof typeof DiskSmartStatus];

export interface HardwareSnapshotResponse {
    id: number;
    capturedAt: string;

    // CPU
    cpuModel?: string;
    cpuCores?: number;
    cpuFrequencyGHz?: number;
    cpuUsagePercent?: number;
    cpuTemperatureC?: number;

    // RAM
    ramTotalGB?: number;
    ramUsedGB?: number;
    ramType?: string;
    ramFrequencyMHz?: number;

    // Disk
    diskCapacityGB?: number;
    diskUsedGB?: number;
    diskType?: string;
    diskModel?: string;
    diskSmartStatus: DiskSmartStatus;

    // Physical
    brand?: string;
    model?: string;
    serialNumber?: string;
    manufactureYear?: string;
    architecture?: string;

    // Calculated
    isObsolete: boolean;

    createdAt: string;
}
