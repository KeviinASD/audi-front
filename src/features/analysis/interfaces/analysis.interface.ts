import type { HardwareSnapshotResponse } from '@/features/hardware/interfaces';
import type { SecuritySnapshotResponse } from '@/features/security/interfaces';
import type { PerformanceSnapshotResponse } from '@/features/performance/interfaces';

export type DailyEquipmentStatus = 'operative' | 'degraded' | 'critical' | 'no-data';
export type StatusComparison = 'improved' | 'same' | 'worsened' | 'unknown';

// ── Heat map item — carga liviana ─────────────────────────────────────────────
// GET /audit-analysis/daily → DailyLaboratoryHeatMap

export interface EquipmentHeatMapItem {
    equipment: {
        id: string;
        code: string;
        name: string;
        location: string;
    };
    status: DailyEquipmentStatus;
    statusCompareToPrevDay: StatusComparison;
    // Flags planos para los íconos de advertencia en cada celda del grid
    isObsolete: boolean;
    hasSecurityRisk: boolean;
    riskyAppsCount: number;
    lastSync: string | null;
}

export interface DailySummary {
    total: number;
    operative: number;
    degraded: number;
    critical: number;
    noData: number;
    withSecurityRisk: number;
    withRiskySoftware: number;
    obsolete: number;
}

export interface DailyLaboratoryHeatMap {
    laboratory: {
        id: string;
        name: string;
        location: string;
    };
    date: string;
    summary: DailySummary;
    equipments: EquipmentHeatMapItem[];
}

// ── Equipment detail — carga pesada ──────────────────────────────────────────
// GET /audit-analysis/equipment-detail?equipmentId=number&date=string

export interface SnapshotRef<T> {
    data: T | null;
    capturedAt: string | null;
    stale: boolean;
    staleDays: number;
}

export interface SoftwareSnapshotRef extends SnapshotRef<unknown> {
    riskyCount: number;
    totalCount: number;
}

export interface SecuritySnapshotRef extends SnapshotRef<SecuritySnapshotResponse> {
    hasRisk: boolean;
}

export interface EquipmentDailyDetail {
    equipment: {
        id: string;
        code: string;
        name: string;
        location: string;
    };
    status: DailyEquipmentStatus;
    statusCompareToPrevDay: StatusComparison;
    hardware: SnapshotRef<HardwareSnapshotResponse>;
    software: SoftwareSnapshotRef;
    security: SecuritySnapshotRef;
    performance: SnapshotRef<PerformanceSnapshotResponse>;
}

// ── AI Analysis ───────────────────────────────────────────────────────────────
// POST /audit-analysis/ai → AiAuditReportResponse

export interface AiFinding {
    equipmentCode: string;
    finding: string;
    auditTest: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
}

export interface AiAnalysisResult {
    executiveSummary: string;
    criticalFindings: AiFinding[];
    generalObservations: string[];
    positiveAspects: string[];
    prioritizedRecommendations: string[];
}

export interface AiAuditReportResponse {
    id: string;
    analysis: AiAnalysisResult;
    tokensUsed: number;
    createdAt: string;
}
