import type {
    GovernanceThresholdResponse,
    ThresholdSeverity,
    ThresholdSourceType,
} from '../interfaces';

/**
 * Traduce el umbral a una expresión que un humano lee de un vistazo:
 * "≤ 30 días", "Debe estar activo", "= good".
 */
export function formatThresholdValue(threshold: GovernanceThresholdResponse): string {
    const { operator, value, unit } = threshold;
    const suffix = unit ? ` ${unit}` : '';

    switch (operator) {
        case 'lte':      return `≤ ${value}${suffix}`;
        case 'gte':      return `≥ ${value}${suffix}`;
        case 'eq':       return `= ${value}${suffix}`;
        case 'neq':      return `≠ ${value}${suffix}`;
        case 'is_true':  return 'Debe estar activo';
        case 'is_false': return 'Debe estar desactivado';
        default:         return value ?? '—';
    }
}

/** Explica el operador en palabras, para quien no lee símbolos matemáticos. */
export function describeOperator(threshold: GovernanceThresholdResponse): string {
    const { operator, value, unit } = threshold;
    const suffix = unit ? ` ${unit}` : '';

    switch (operator) {
        case 'lte':      return `Se incumple si supera ${value}${suffix}`;
        case 'gte':      return `Se incumple si es menor a ${value}${suffix}`;
        case 'eq':       return `Se incumple si es distinto de "${value}"`;
        case 'neq':      return `Se incumple si es igual a "${value}"`;
        case 'is_true':  return 'Se incumple si está desactivado o ausente';
        case 'is_false': return 'Se incumple si está activado';
        default:         return 'Criterio no definido';
    }
}

export const SEVERITY_STYLES: Record<ThresholdSeverity, {
    label: string;
    badge: string;
    dot: string;
}> = {
    critical: {
        label: 'Crítica',
        badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
        dot:   'bg-red-500',
    },
    high: {
        label: 'Alta',
        badge: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
        dot:   'bg-orange-500',
    },
    medium: {
        label: 'Media',
        badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
        dot:   'bg-amber-500',
    },
    low: {
        label: 'Baja',
        badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800',
        dot:   'bg-sky-500',
    },
};

export const SOURCE_TYPE_LABELS: Record<ThresholdSourceType, {
    label: string;
    hint: string;
}> = {
    standard: {
        label: 'Estándar técnico',
        hint: 'El valor proviene de una línea base reconocida del sector.',
    },
    regulation: {
        label: 'Norma legal',
        hint: 'El valor responde a una obligación normativa, no a una preferencia técnica.',
    },
    professional_judgment: {
        label: 'Criterio profesional',
        hint: 'El valor lo definió el auditor y se sostiene con la justificación declarada.',
    },
};
