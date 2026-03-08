import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLaboratories } from '@/features/equipos/hooks/useLaboratory';
import { useDailyHeatMap } from '../hooks/useAnalysis';
import { AnalysisService } from '../services/analysis.service';
import { HeatMap } from '../components/heatmap/HeatMap';
import type { AiAuditReportResponse, EquipmentHeatMapItem } from '../interfaces';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    BarChart3,
    CalendarDays,
    CheckCircle2,
    AlertCircle,
    XCircle,
    WifiOff,
    ShieldAlert,
    PackageX,
    Clock,
    ChevronRight,
    Sparkles,
    Loader2,
    Bot,
    AlertTriangle,
} from 'lucide-react';

// ── Today's date in YYYY-MM-DD ────────────────────────────────────────────────

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

// ── AI result helpers ─────────────────────────────────────────────────────────

const severityConfig = {
    critical: { label: 'Crítico',  className: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' },
    high:     { label: 'Alto',     className: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' },
    medium:   { label: 'Medio',    className: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' },
    low:      { label: 'Bajo',     className: 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800' },
} as const;

function ListSection({ title, icon: Icon, items, iconClass }: { title: string; icon: React.ElementType; items: string[]; iconClass: string }) {
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

const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

function AiResultSection({ report }: { report: AiAuditReportResponse }) {
    const { analysis } = report;
    const sorted = [...analysis.criticalFindings].sort(
        (a, b) => (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99),
    );

    const criticalCount = sorted.filter(f => f.severity === 'critical').length;
    const highCount     = sorted.filter(f => f.severity === 'high').length;

    return (
        <div className="rounded-2xl border border-primary/20 overflow-hidden animate-in fade-in duration-500 shadow-sm">
            {/* ── Header gradient ── */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b border-primary/15 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">Análisis IA · Laboratorio</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary font-medium">Claude</Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(report.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
                            {' · '}{report.tokensUsed?.toLocaleString() ?? '—'} tokens
                        </p>
                    </div>
                </div>
                {/* Severity counters */}
                {sorted.length > 0 && (
                    <div className="flex items-center gap-2 shrink-0">
                        {criticalCount > 0 && (
                            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                                <XCircle className="h-3 w-3" />{criticalCount} crítico{criticalCount > 1 ? 's' : ''}
                            </span>
                        )}
                        {highCount > 0 && (
                            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                                <AlertTriangle className="h-3 w-3" />{highCount} alto{highCount > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-[#16161a] p-6 space-y-6">
                {/* ── Executive summary ── */}
                <div className="relative pl-4 border-l-2 border-primary/40">
                    <p className="text-xs font-semibold text-primary/70 uppercase tracking-widest mb-1.5">Resumen ejecutivo</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{analysis.executiveSummary}</p>
                </div>

                {/* ── Critical findings ── */}
                {sorted.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                Hallazgos <span className="text-gray-400 font-normal">({sorted.length})</span>
                            </h3>
                        </div>
                        <div className="space-y-2">
                            {sorted.map((f, i) => {
                                const sev = severityConfig[f.severity] ?? severityConfig.medium;
                                return (
                                    <div
                                        key={i}
                                        className="rounded-xl border border-gray-100 dark:border-[#2a2a30] bg-gray-50/50 dark:bg-[#1a1a20] p-4 hover:border-gray-200 dark:hover:border-[#3a3a42] transition-colors"
                                    >
                                        {/* Top row: equipment code + badges */}
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold font-mono px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                                                <PackageX className="h-3 w-3" />
                                                {f.equipmentCode}
                                            </span>
                                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sev.className}`}>
                                                {sev.label}
                                            </Badge>
                                            <span className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                                                {f.auditTest}
                                            </span>
                                        </div>
                                        {/* Finding text */}
                                        <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-snug mb-2">{f.finding}</p>
                                        {/* Recommendation */}
                                        <div className="flex items-start gap-1.5">
                                            <ChevronRight className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.recommendation}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Three columns ── */}
                <div className="grid md:grid-cols-3 gap-4">
                    <ListSection title="Observaciones"      icon={AlertCircle}  items={analysis.generalObservations}        iconClass="text-amber-500" />
                    <ListSection title="Aspectos positivos" icon={CheckCircle2} items={analysis.positiveAspects}            iconClass="text-emerald-500" />
                    <ListSection title="Recomendaciones"    icon={ChevronRight} items={analysis.prioritizedRecommendations} iconClass="text-blue-500" />
                </div>
            </div>
        </div>
    );
}

// ── Summary cards ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
    label: string;
    value: number;
    icon: React.ElementType;
    accentClass: string;
    loading: boolean;
}

function SummaryCard({ label, value, icon: Icon, accentClass, loading }: SummaryCardProps) {
    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${accentClass}`}>
            <Icon className="h-5 w-5 shrink-0" />
            <div className="min-w-0">
                <p className="text-xs text-current opacity-70 truncate">{label}</p>
                {loading
                    ? <Skeleton className="h-6 w-8 mt-0.5" />
                    : <p className="text-xl font-bold leading-tight">{value}</p>}
            </div>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AnalysisPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { laboratories, loading: labsLoading } = useLaboratories();

    const selectedLabId = searchParams.get('lab') ?? '';
    const selectedDate  = searchParams.get('date') ?? todayStr();

    // AI analysis state
    const [aiState, setAiState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
    const [aiReport, setAiReport] = useState<AiAuditReportResponse | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);

    const setSelectedLabId = (v: string) => {
        setSearchParams(prev => { const n = new URLSearchParams(prev); v ? n.set('lab', v) : n.delete('lab'); return n; }, { replace: true });
        setAiState('idle');
        setAiReport(null);
    };

    const setSelectedDate = (v: string) => {
        setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('date', v); return n; }, { replace: true });
        setAiState('idle');
        setAiReport(null);
    };

    const { data, loading, error } = useDailyHeatMap(
        selectedLabId || null,
        selectedDate,
    );

    const handleAiAnalysis = async () => {
        if (!selectedLabId) return;
        setAiState('loading');
        setAiError(null);
        try {
            const report = await AnalysisService.requestAiAnalysis({
                laboratoryId: Number(selectedLabId),
                date: selectedDate,
            });
            setAiReport(report);
            setAiState('done');
        } catch {
            setAiError('No se pudo completar el análisis de IA. Intenta de nuevo.');
            setAiState('error');
        }
    };

    const summary = data?.summary;

    const handleSelectEquipment = (eq: EquipmentHeatMapItem) => {
        navigate(`/main/analysis/equipo/${eq.equipment.id}?date=${selectedDate}`);
    };

    return (
        <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-primary" />
                        Análisis Diario
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Vista consolidada del estado de los equipos por laboratorio y fecha.
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Lab selector */}
                    <Select
                        value={selectedLabId}
                        onValueChange={(v) => setSelectedLabId(v)}
                        disabled={labsLoading}
                    >
                        <SelectTrigger className="w-56 bg-white dark:bg-[#16161a] border-gray-200 dark:border-[#1F1F23]">
                            <SelectValue placeholder={labsLoading ? 'Cargando labs…' : 'Seleccionar laboratorio'} />
                        </SelectTrigger>
                        <SelectContent>
                            {laboratories.map(lab => (
                                <SelectItem key={lab.id} value={String(lab.id)}>
                                    {lab.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Date picker */}
                    <div className="relative flex items-center">
                        <CalendarDays className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
                        <input
                            type="date"
                            value={selectedDate}
                            max={todayStr()}
                            onChange={e => setSelectedDate(e.target.value)}
                            className="pl-9 pr-3 py-2 h-10 rounded-md border border-gray-200 dark:border-[#1F1F23]
                                bg-white dark:bg-[#16161a] text-sm text-gray-900 dark:text-gray-100
                                focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                        />
                    </div>

                    {/* AI analysis button */}
                    {selectedLabId && data && (
                        <Button
                            onClick={handleAiAnalysis}
                            disabled={aiState === 'loading'}
                            className="gap-2"
                        >
                            {aiState === 'loading'
                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Analizando…</>
                                : <><Sparkles className="h-4 w-4" /> Analizar laboratorio</>}
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Empty state — no lab selected ── */}
            {!selectedLabId && !loading && (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
                    <BarChart3 className="h-14 w-14 opacity-20" />
                    <p className="text-sm font-medium">Selecciona un laboratorio para comenzar el análisis</p>
                    <p className="text-xs opacity-70">El sistema mostrará el estado de todos los equipos del día elegido</p>
                </div>
            )}

            {/* ── Error ── */}
            {error && selectedLabId && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                    <XCircle className="h-5 w-5 shrink-0" />
                    {error}
                </div>
            )}

            {/* ── Main content ── */}
            {(loading || data) && selectedLabId && (
                <>
                    {/* Summary row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                        <SummaryCard label="Total"             loading={loading} value={summary?.total ?? 0}             icon={BarChart3}    accentClass="border-gray-200 dark:border-[#1F1F23] text-gray-700 dark:text-gray-300" />
                        <SummaryCard label="Operativos"        loading={loading} value={summary?.operative ?? 0}         icon={CheckCircle2} accentClass="border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400" />
                        <SummaryCard label="Degradados"        loading={loading} value={summary?.degraded ?? 0}          icon={AlertCircle}  accentClass="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400" />
                        <SummaryCard label="Críticos"          loading={loading} value={summary?.critical ?? 0}          icon={XCircle}      accentClass="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10 text-red-700 dark:text-red-400" />
                        <SummaryCard label="Sin datos"         loading={loading} value={summary?.noData ?? 0}            icon={WifiOff}      accentClass="border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 text-gray-500" />
                        <SummaryCard label="Riesgo seguridad"  loading={loading} value={summary?.withSecurityRisk ?? 0}  icon={ShieldAlert}  accentClass="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-400" />
                        <SummaryCard label="Software riesgoso" loading={loading} value={summary?.withRiskySoftware ?? 0} icon={PackageX}     accentClass="border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-400" />
                    </div>

                    {/* Heat map */}
                    <div className="rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#1F1F23] bg-gray-50/50 dark:bg-[#1F1F23]/50">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {loading ? 'Cargando…' : data
                                        ? `${data.laboratory.name} · ${new Date(data.date + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                                        : 'Mapa de calor'}
                                </span>
                            </div>
                            {!loading && data && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {data.laboratory.location}
                                </span>
                            )}
                        </div>
                        <div className="p-4">
                            <HeatMap
                                equipments={data?.equipments ?? []}
                                selectedId={null}
                                onSelect={handleSelectEquipment}
                                loading={loading}
                            />
                        </div>
                    </div>

                    {!loading && data && (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 py-2">
                            <ChevronRight className="h-4 w-4" />
                            Haz clic en un equipo del mapa para ver su detalle completo
                        </div>
                    )}

                    {/* AI error */}
                    {aiState === 'error' && aiError && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                            <XCircle className="h-5 w-5 shrink-0" />
                            {aiError}
                        </div>
                    )}

                    {/* AI result */}
                    {aiState === 'done' && aiReport && (
                        <AiResultSection report={aiReport} />
                    )}
                </>
            )}
        </div>
    );
}
