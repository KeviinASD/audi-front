export interface ProcessInfo {
    pid: number;
    name: string;
    cpuPercent: number;
    ramMB: number;
    status: string;
}

export interface PerformanceSnapshotResponse {
    id: number;
    capturedAt: string;
    mode: string;

    // CPU
    cpuUsagePercent?: number;
    cpuTemperatureC?: number;

    // RAM
    ramTotalGB?: number;
    ramUsedGB?: number;
    ramUsagePercent?: number;

    // Disk
    diskTotalGB?: number;
    diskUsedGB?: number;
    diskUsagePercent?: number;
    diskTemperatureC?: number;
    diskReadSpeedMBs?: number;
    diskWriteSpeedMBs?: number;

    // Network
    networkSentMBs?: number;
    networkReceivedMBs?: number;
    networkAdapterName?: string;

    // Uptime
    uptimeSeconds?: number;
    lastBootTime?: string;

    // Top processes
    topProcessesByCpu?: ProcessInfo[];
    topProcessesByRam?: ProcessInfo[];

    // Flags
    hasCpuAlert: boolean;
    hasRamAlert: boolean;
    hasDiskAlert: boolean;
    hasThermalAlert: boolean;

    createdAt: string;
}

export interface PerformanceAveragesResponse {
    avgCpuUsagePercent: number;
    avgRamUsagePercent: number;
    avgDiskUsagePercent: number;
    avgCpuTemperatureC?: number;
    totalSnapshots: number;
}

export interface PerformanceAlertEquipmentResponse {
    id: number;
    code: string;
    name: string;
    ubication?: string;
    status: string;
    lastConnection?: string;
    hasCpuAlert: boolean;
    hasRamAlert: boolean;
    hasDiskAlert: boolean;
    hasThermalAlert: boolean;
}
