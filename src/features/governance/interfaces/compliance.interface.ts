import type { ThresholdSeverity } from './governance-threshold.interface';

export const ComplianceStatus = {
    COMPLIANT:     'compliant',
    BREACHED:      'breached',
    NO_DATA:       'no-data',
    NOT_EVALUABLE: 'not-evaluable',
} as const;

export type ComplianceStatus = typeof ComplianceStatus[keyof typeof ComplianceStatus];

export const EvidenceSource = {
    SECURITY:    'security',
    HARDWARE:    'hardware',
    PERFORMANCE: 'performance',
    SOFTWARE:    'software',
    EQUIPMENT:   'equipment',
} as const;

export type EvidenceSource = typeof EvidenceSource[keyof typeof EvidenceSource];

/** Resultado de cruzar UN umbral contra el dato real de UN equipo. */
export interface ThresholdEvaluationResponse {
    thresholdId: number;
    code: string;
    label: string;
    category: string;
    field: string;

    status: ComplianceStatus;
    /** Lo que el equipo reportó: "104 días", "2 cuentas admin". */
    actual: string;
    /** Lo que exige la política: "máximo 30 días". */
    expected: string;
    message: string;
    detail?: string;

    /** De qué captura salió el dato y de cuándo es. */
    evidenceSource: EvidenceSource;
    evidenceDate: string | null;
    evidenceAgeDays: number | null;
    /** El dato existe pero está vencido: describe el pasado, no el presente. */
    isStale: boolean;

    severityOnBreach: ThresholdSeverity;
    cobitObjective: string;
    isoClause: string | null;
    isApproved: boolean;
}

export interface DataFreshness {
    security: string | null;
    hardware: string | null;
    performance: string | null;
    software: string | null;
    mostRecent: string | null;
    ageDays: number | null;
    isStale: boolean;
}

export interface ComplianceSummary {
    evaluated: number;
    compliant: number;
    breached: number;
    noData: number;
    stale: number;
    complianceRate: number;
    breachesBySeverity: Record<ThresholdSeverity, number>;
}

export interface EquipmentComplianceResponse {
    equipment: {
        id: number;
        code: string;
        name: string;
        lastConnection: string | null;
    };
    freshness: DataFreshness;
    summary: ComplianceSummary;
    evaluations: ThresholdEvaluationResponse[];
}

export interface ThresholdParkStat {
    thresholdId: number;
    code: string;
    label: string;
    category: string;
    severityOnBreach: ThresholdSeverity;
    cobitObjective: string;
    breached: number;
    compliant: number;
    noData: number;
    complianceRate: number;
}

export interface ParkComplianceResponse {
    summary: {
        equipmentCount: number;
        staleEquipments: number;
        compliant: number;
        breached: number;
        noData: number;
        stale: number;
        complianceRate: number;
        breachesBySeverity: Record<ThresholdSeverity, number>;
        /** Equipos que fallaron al evaluarse y quedaron fuera del reporte. */
        skipped: number;
    };
    byThreshold: ThresholdParkStat[];
    equipments: EquipmentComplianceResponse[];
}
