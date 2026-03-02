import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useEquipmentDetail } from '../hooks/useAnalysis';
import { AnalysisService } from '../services/analysis.service';
import { EquipmentDetailPanel } from '../components/detail/EquipmentDetailPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { AiAuditReportResponse } from '../interfaces';
import {
    ArrowLeft,
    BarChart3,
    XCircle,
    Sparkles,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    AlertCircle,
    Bot,
} from 'lucide-react';

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

// ── Severity config ───────────────────────────────────────────────────────────

const severityConfig = {
    critical: { label: 'Crítico',  className: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' },
    high:     { label: 'Alto',     className: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' },
    medium:   { label: 'Medio',    className: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' },
    low:      { label: 'Bajo',     className: 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800' },
} as const;

// ── List section (observations / positives / recommendations) ─────────────────

function ListSection({
    title,
    icon: Icon,
    items,
    iconClass,
}: {
    title: string;
    icon: React.ElementType;
    items: string[];
    iconClass: string;
}) {
    if (!items.length) return null;
    return (
        <div className="rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] p-4">
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-1.5">
                <Icon className={`h-3.5 w-3.5 ${iconClass}`} />
                {title}
            </h4>
            <ul className="space-y-2">
                {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mt-1.5 shrink-0" />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}

// ── AI result section ─────────────────────────────────────────────────────────

function AiResultSection({ report }: { report: AiAuditReportResponse }) {
    const { analysis } = report;

    return (
        <div className="rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent overflow-hidden animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-primary/10 bg-primary/5">
                <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">Análisis IA</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                        Claude
                    </Badge>
                </div>
                <span className="text-xs text-gray-400">
                    {report.tokensUsed?.toLocaleString() ?? '—'} tokens · {new Date(report.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>

            <div className="p-5 space-y-5">
                {/* Executive summary */}
                <div className="rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] p-4">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                        Resumen ejecutivo
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {analysis.executiveSummary}
                    </p>
                </div>

                {/* Critical findings */}
                {analysis.criticalFindings.length > 0 && (
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                            Hallazgos ({analysis.criticalFindings.length})
                        </h3>
                        <div className="space-y-2">
                            {analysis.criticalFindings.map((f, i) => {
                                const sev = severityConfig[f.severity] ?? severityConfig.medium;
                                return (
                                    <div
                                        key={i}
                                        className="rounded-xl border border-gray-100 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] p-3"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-1.5">
                                            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-snug">
                                                {f.finding}
                                            </p>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] px-1.5 py-0 ${sev.className}`}
                                                >
                                                    {sev.label}
                                                </Badge>
                                                <span className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                                    {f.auditTest}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                            {f.recommendation}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Observations / Positives / Recommendations */}
                <div className="grid md:grid-cols-3 gap-4">
                    <ListSection
                        title="Observaciones"
                        icon={AlertCircle}
                        items={analysis.generalObservations}
                        iconClass="text-amber-500"
                    />
                    <ListSection
                        title="Aspectos positivos"
                        icon={CheckCircle2}
                        items={analysis.positiveAspects}
                        iconClass="text-emerald-500"
                    />
                    <ListSection
                        title="Recomendaciones"
                        icon={ChevronRight}
                        items={analysis.prioritizedRecommendations}
                        iconClass="text-blue-500"
                    />
                </div>
            </div>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EquipmentDetailPage() {
    const { equipmentId } = useParams<{ equipmentId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const date = searchParams.get('date') ?? todayStr();

    const { data, loading, error } = useEquipmentDetail(equipmentId ?? null, date);

    // AI analysis state
    const [aiState, setAiState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
    const [aiReport, setAiReport] = useState<AiAuditReportResponse | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);

    const handleAiAnalysis = async () => {
        if (!data) return;
        setAiState('loading');
        setAiError(null);
        try {
            const report = await AnalysisService.requestAiAnalysis(data.equipment.id, date);
            setAiReport(report);
            setAiState('done');
        } catch {
            setAiError('No se pudo completar el análisis de IA. Intenta de nuevo.');
            setAiState('error');
        }
    };

    const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mt-0.5 shrink-0 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <BarChart3 className="h-6 w-6 text-primary" />
                            {loading
                                ? 'Cargando detalle…'
                                : data?.equipment.name ?? 'Detalle de equipo'}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {data
                                ? `${data.equipment.code} · ${dateLabel}`
                                : dateLabel}
                        </p>
                    </div>
                </div>

                {/* Analizar con IA */}
                {data && (
                    <Button
                        onClick={handleAiAnalysis}
                        disabled={aiState === 'loading'}
                        className="shrink-0 gap-2"
                    >
                        {aiState === 'loading'
                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Analizando…</>
                            : <><Sparkles className="h-4 w-4" /> Analizar con IA</>}
                    </Button>
                )}
            </div>

            {/* ── Load error ── */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                    <XCircle className="h-5 w-5 shrink-0" />
                    {error}
                </div>
            )}

            {/* ── Loading skeletons ── */}
            {loading && (
                <div className="space-y-4">
                    <Skeleton className="h-36 rounded-xl" />
                    <div className="grid md:grid-cols-2 gap-4">
                        <Skeleton className="h-52 rounded-xl" />
                        <Skeleton className="h-52 rounded-xl" />
                        <Skeleton className="h-44 rounded-xl" />
                        <Skeleton className="h-44 rounded-xl" />
                    </div>
                </div>
            )}

            {/* ── Detail panel ── */}
            {!loading && data && (
                <EquipmentDetailPanel detail={data} />
            )}

            {/* ── AI error ── */}
            {aiState === 'error' && aiError && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                    <XCircle className="h-5 w-5 shrink-0" />
                    {aiError}
                </div>
            )}

            {/* ── AI result ── */}
            {aiState === 'done' && aiReport && (
                <AiResultSection report={aiReport} />
            )}
        </div>
    );
}
