import { CheckCircle2, XCircle, HelpCircle, Wrench, ArrowRight, CalendarClock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ThresholdEvaluationResponse } from '../../interfaces';
import { SEVERITY_STYLES } from '../../lib/threshold-display';

const STATUS_META = {
    compliant: {
        icon: CheckCircle2,
        label: 'Cumple',
        color: 'text-emerald-600 dark:text-emerald-400',
        ring:  'border-l-emerald-500',
    },
    breached: {
        icon: XCircle,
        label: 'Incumple',
        color: 'text-red-600 dark:text-red-400',
        ring:  'border-l-red-500',
    },
    'no-data': {
        icon: HelpCircle,
        label: 'Sin datos',
        color: 'text-gray-400 dark:text-gray-500',
        ring:  'border-l-gray-300 dark:border-l-gray-700',
    },
    'not-evaluable': {
        icon: Wrench,
        label: 'No evaluable',
        color: 'text-amber-600 dark:text-amber-400',
        ring:  'border-l-amber-400',
    },
} as const;

interface EvaluationRowProps {
    evaluation: ThresholdEvaluationResponse;
}

/**
 * Una fila = un umbral cruzado contra el dato real del equipo.
 * Muestra los tres elementos juntos: qué se midió, qué se exige, y el veredicto.
 */
export const EvaluationRow = ({ evaluation }: EvaluationRowProps) => {
    const meta = STATUS_META[evaluation.status];
    const Icon = meta.icon;
    const severity = SEVERITY_STYLES[evaluation.severityOnBreach];
    const isBreached = evaluation.status === 'breached';

    return (
        <div
            className={`border-l-4 ${meta.ring} bg-white dark:bg-[#16161a] border border-l-4 border-gray-200 dark:border-[#1F1F23] rounded-lg p-4 flex flex-col gap-3`}
        >
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                    <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${meta.color}`} />
                    <div className="min-w-0">
                        <div className="font-mono text-[10px] text-gray-400">{evaluation.code}</div>
                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {evaluation.label}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    {isBreached && (
                        <Badge variant="outline" className={`text-[10px] font-normal ${severity.badge}`}>
                            {severity.label}
                        </Badge>
                    )}
                    {!evaluation.isApproved && (
                        <Badge
                            variant="outline"
                            className="text-[10px] font-normal text-gray-500 border-dashed"
                            title="Este umbral todavía no fue aprobado: su resultado no es política vigente."
                        >
                            Sin aprobar
                        </Badge>
                    )}
                    <Badge
                        variant="outline"
                        className="font-mono text-[10px] bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800"
                    >
                        {evaluation.cobitObjective}
                    </Badge>
                </div>
            </div>

            {/* El cruce: dato real → umbral */}
            <div className="flex flex-wrap items-center gap-2 text-sm pl-6">
                <span className="text-[10px] uppercase tracking-wider text-gray-400">Reportado</span>
                <span className={`font-semibold ${isBreached ? meta.color : 'text-gray-900 dark:text-gray-100'}`}>
                    {evaluation.actual}
                </span>
                <ArrowRight className="h-3 w-3 text-gray-300 dark:text-gray-600" />
                <span className="text-[10px] uppercase tracking-wider text-gray-400">Política</span>
                <span className="text-gray-700 dark:text-gray-300">{evaluation.expected}</span>
                <code className="ml-auto text-[10px] text-gray-400">{evaluation.field}</code>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 pl-6">
                {evaluation.message}
            </p>

            {evaluation.detail && (
                <p className="text-xs text-gray-500 dark:text-gray-500 pl-6 italic">
                    {evaluation.detail}
                </p>
            )}

            {/* Fecha de la evidencia: un veredicto sin fecha no es auditable */}
            {evaluation.evidenceDate && (
                <div
                    className={`flex items-center gap-1.5 pl-6 text-[11px] ${
                        evaluation.isStale
                            ? 'text-amber-600 dark:text-amber-500'
                            : 'text-gray-400 dark:text-gray-500'
                    }`}
                >
                    <CalendarClock className="h-3 w-3 shrink-0" />
                    <span>
                        Evidencia del {new Date(evaluation.evidenceDate).toLocaleDateString()}
                        {evaluation.evidenceAgeDays !== null && (
                            <> · hace {evaluation.evidenceAgeDays} día{evaluation.evidenceAgeDays === 1 ? '' : 's'}</>
                        )}
                    </span>
                    {evaluation.isStale && (
                        <Badge
                            variant="outline"
                            className="ml-1 text-[10px] font-normal bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                        >
                            Vencida
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
};
