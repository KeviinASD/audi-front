import { useState } from 'react';
import {
    ChevronDown,
    Gauge,
    ShieldAlert,
    CheckCircle2,
    Clock,
    BookOpen,
    Scale,
    Pencil,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { GovernanceThresholdResponse } from '../../interfaces';
import {
    formatThresholdValue,
    describeOperator,
    SEVERITY_STYLES,
    SOURCE_TYPE_LABELS,
} from '../../lib/threshold-display';

interface ThresholdCardProps {
    threshold: GovernanceThresholdResponse;
    onEdit: (threshold: GovernanceThresholdResponse) => void;
    onApprove: (threshold: GovernanceThresholdResponse) => void;
}

export const ThresholdCard = ({ threshold, onEdit, onApprove }: ThresholdCardProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const severity = SEVERITY_STYLES[threshold.severityOnBreach];
    const source   = SOURCE_TYPE_LABELS[threshold.sourceType];
    const isApproved = !!threshold.approvedAt;

    return (
        <div className="rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] overflow-hidden transition-shadow hover:shadow-md">

            {/* ── Cabecera ─────────────────────────────────────────── */}
            <div className="p-5 flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                        <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${severity.dot}`} />
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500">
                                    {threshold.code}
                                </span>
                                {!threshold.isActive && (
                                    <Badge variant="outline" className="text-[10px] font-normal text-gray-500">
                                        Inactivo
                                    </Badge>
                                )}
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 leading-snug">
                                {threshold.label}
                            </h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={`font-normal ${severity.badge}`}>
                            <ShieldAlert className="h-3 w-3 mr-1" />
                            {severity.label}
                        </Badge>
                        {isApproved ? (
                            <Badge
                                variant="outline"
                                className="font-normal bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                            >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Aprobado
                            </Badge>
                        ) : (
                            <Badge
                                variant="outline"
                                className="font-normal bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-700"
                            >
                                <Clock className="h-3 w-3 mr-1" />
                                Sin aprobar
                            </Badge>
                        )}
                    </div>
                </div>

                {/* ── Valor + explicaciones ────────────────────────── */}
                <div className="flex flex-col sm:flex-row gap-5">

                    <div className="sm:w-44 shrink-0">
                        <div className="rounded-lg border border-gray-200 dark:border-[#2a2a30] bg-gray-50/60 dark:bg-[#1F1F23]/50 p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                                <Gauge className="h-3 w-3" />
                                Valor aceptado
                            </div>
                            <div className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight break-words">
                                {formatThresholdValue(threshold)}
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-[#2a2a30]">
                                <code className="text-[10px] text-gray-500 dark:text-gray-400 break-all">
                                    {threshold.field}
                                </code>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-3 min-w-0">
                        <ExplainBlock
                            title="¿Qué mide?"
                            text={threshold.whatItMeasures}
                        />
                        <ExplainBlock
                            title="¿Por qué importa?"
                            text={threshold.whyItMatters}
                        />
                        <ExplainBlock
                            title="¿Cómo se evalúa?"
                            text={threshold.howItIsEvaluated}
                            hint={describeOperator(threshold)}
                        />
                    </div>
                </div>
            </div>

            {/* ── Pie: trazabilidad + detalle ──────────────────────── */}
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <div className="px-5 py-3 border-t border-gray-200 dark:border-[#1F1F23] bg-gray-50/50 dark:bg-[#1F1F23]/30 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                            variant="outline"
                            className="font-mono text-[10px] bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800"
                        >
                            COBIT {threshold.cobitObjective}
                        </Badge>
                        {threshold.isoClause && (
                            <Badge
                                variant="outline"
                                className="font-mono text-[10px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                            >
                                ISO {threshold.isoClause}
                            </Badge>
                        )}
                        {threshold.legalBasis && (
                            <Badge
                                variant="outline"
                                className="text-[10px] bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800"
                            >
                                <Scale className="h-2.5 w-2.5 mr-1" />
                                Norma legal
                            </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] font-normal text-gray-600 dark:text-gray-400">
                            {source.label}
                        </Badge>
                    </div>

                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-600 dark:text-gray-400">
                            Ver fundamento
                            <ChevronDown
                                className={`ml-1 h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            />
                        </Button>
                    </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                    <div className="px-5 py-4 border-t border-gray-200 dark:border-[#1F1F23] space-y-4">

                        <div>
                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                                <BookOpen className="h-3 w-3" />
                                ¿Por qué ese valor y no otro?
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {threshold.rationale}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <DetailItem
                                label="Origen del valor"
                                value={source.label}
                                hint={source.hint}
                            />
                            {threshold.sourceReference && (
                                <DetailItem label="Referencia" value={threshold.sourceReference} />
                            )}
                            {threshold.legalBasis && (
                                <DetailItem label="Base legal" value={threshold.legalBasis} />
                            )}
                            <DetailItem
                                label="Estado de aprobación"
                                value={
                                    isApproved
                                        ? `${threshold.approvedBy} · ${new Date(threshold.approvedAt!).toLocaleDateString()}`
                                        : 'Pendiente de aprobación'
                                }
                                hint={
                                    isApproved
                                        ? undefined
                                        : 'Un umbral sin aprobar es una sugerencia, no una política.'
                                }
                            />
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => onEdit(threshold)}
                            >
                                <Pencil className="mr-1.5 h-3 w-3" />
                                Ajustar umbral
                            </Button>
                            {!isApproved && (
                                <Button
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => onApprove(threshold)}
                                >
                                    <CheckCircle2 className="mr-1.5 h-3 w-3" />
                                    Aprobar
                                </Button>
                            )}
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
};

// ── Subcomponentes ───────────────────────────────────────────────────────────

const ExplainBlock = ({
    title,
    text,
    hint,
}: {
    title: string;
    text: string;
    hint?: string;
}) => (
    <div>
        <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">
            {title}
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {text}
        </p>
        {hint && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-mono">
                {hint}
            </p>
        )}
    </div>
);

const DetailItem = ({
    label,
    value,
    hint,
}: {
    label: string;
    value: string;
    hint?: string;
}) => (
    <div>
        <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">
            {label}
        </div>
        <div className="text-gray-800 dark:text-gray-200">{value}</div>
        {hint && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 italic">{hint}</p>
        )}
    </div>
);
