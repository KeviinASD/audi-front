// ── Enumerados (patrón const + tipo derivado por `erasableSyntaxOnly`) ───────

export const ThresholdOperator = {
    LTE:      'lte',
    GTE:      'gte',
    EQ:       'eq',
    NEQ:      'neq',
    IS_TRUE:  'is_true',
    IS_FALSE: 'is_false',
} as const;

export type ThresholdOperator = typeof ThresholdOperator[keyof typeof ThresholdOperator];

export const ThresholdSeverity = {
    LOW:      'low',
    MEDIUM:   'medium',
    HIGH:     'high',
    CRITICAL: 'critical',
} as const;

export type ThresholdSeverity = typeof ThresholdSeverity[keyof typeof ThresholdSeverity];

export const ThresholdSourceType = {
    STANDARD:              'standard',
    REGULATION:            'regulation',
    PROFESSIONAL_JUDGMENT: 'professional_judgment',
} as const;

export type ThresholdSourceType = typeof ThresholdSourceType[keyof typeof ThresholdSourceType];

// ── Respuestas del backend ───────────────────────────────────────────────────

export interface GovernanceThresholdResponse {
    id: number;
    code: string;
    category: string;
    field: string;
    label: string;

    /** Qué mide, en lenguaje llano. */
    whatItMeasures: string;
    /** Qué riesgo se corre si se incumple. */
    whyItMatters: string;
    /** Cómo se evalúa, explicado en texto. */
    howItIsEvaluated: string;

    operator: ThresholdOperator;
    value: string | null;
    unit: string | null;
    severityOnBreach: ThresholdSeverity;

    cobitObjective: string;
    isoClause: string | null;
    legalBasis: string | null;
    sourceType: ThresholdSourceType;
    sourceReference: string | null;
    /** Por qué ese valor y no otro. */
    rationale: string;

    approvedBy: string | null;
    approvedAt: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ThresholdCategoryGroup {
    category: string;
    label: string;
    description: string;
    order: number;
    thresholds: GovernanceThresholdResponse[];
}

export interface ThresholdSummary {
    total: number;
    active: number;
    approved: number;
    pendingApproval: number;
    approvalRate: number;
    bySeverity: Record<ThresholdSeverity, number>;
    cobitObjectives: string[];
}

export interface GroupedThresholdsResponse {
    summary: ThresholdSummary;
    groups: ThresholdCategoryGroup[];
}

export interface SeverityMatrixEntry {
    severity: ThresholdSeverity;
    label: string;
    criterion: string;
    examples: string;
}

// ── Peticiones al backend ────────────────────────────────────────────────────

export interface UpdateThresholdRequest {
    value?: string;
    operator?: ThresholdOperator;
    severityOnBreach?: ThresholdSeverity;
    rationale?: string;
    isActive?: boolean;
}

export interface ApproveThresholdRequest {
    approvedBy: string;
}
