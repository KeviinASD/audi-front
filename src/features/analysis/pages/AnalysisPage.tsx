import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLaboratories } from '@/features/equipos/hooks/useLaboratory';
import { useDailyHeatMap } from '../hooks/useAnalysis';
import { HeatMap } from '../components/heatmap/HeatMap';
import type { EquipmentHeatMapItem } from '../interfaces';
import { Skeleton } from '@/components/ui/skeleton';
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
} from 'lucide-react';

// ── Today's date in YYYY-MM-DD ────────────────────────────────────────────────

function todayStr() {
    return new Date().toISOString().split('T')[0];
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

    const setSelectedLabId = (v: string) =>
        setSearchParams(prev => { const n = new URLSearchParams(prev); v ? n.set('lab', v) : n.delete('lab'); return n; }, { replace: true });

    const setSelectedDate = (v: string) =>
        setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('date', v); return n; }, { replace: true });

    const { data, loading, error } = useDailyHeatMap(
        selectedLabId || null,
        selectedDate,
    );

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
                </>
            )}
        </div>
    );
}
