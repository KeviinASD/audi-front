import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEquipmentById } from '@/features/equipos/hooks/useEquipment';
import { usePerformanceHistory, usePerformanceAverages } from '../hooks/usePerformance';
import { PerformanceSnapshot, PerformanceSnapshotSkeleton } from '../components/snapshot/PerformanceSnapshot';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
    ArrowLeft,
    Activity,
    AlertTriangle,
    CalendarDays,
    Cpu,
    MemoryStick,
    HardDrive,
    TrendingUp,
} from 'lucide-react';

const RANGE_OPTIONS = [
    { label: '7 días', days: 7 },
    { label: '30 días', days: 30 },
    { label: '90 días', days: 90 },
];

function usageColor(pct?: number) {
    if (pct == null) return 'bg-gray-300';
    if (pct >= 90) return 'bg-red-500';
    if (pct >= 70) return 'bg-amber-400';
    return 'bg-emerald-500';
}

function fmt(val?: number | string | null, d = 1) {
    if (val == null) return '—';
    const n = Number(val);
    return isNaN(n) ? '—' : n.toFixed(d);
}

// ── Averages card ─────────────────────────────────────────────────────────────

function AveragesCard({
    avgCpu,
    avgRam,
    avgDisk,
    avgTemp,
    totalSnapshots,
    loading,
}: {
    avgCpu?: number;
    avgRam?: number;
    avgDisk?: number;
    avgTemp?: number;
    totalSnapshots?: number;
    loading: boolean;
}) {
    const metrics = [
        { label: 'CPU promedio', icon: Cpu, value: avgCpu, unit: '%' },
        { label: 'RAM promedio', icon: MemoryStick, value: avgRam, unit: '%' },
        { label: 'Disco promedio', icon: HardDrive, value: avgDisk, unit: '%' },
    ];

    return (
        <div className="rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#1F1F23] bg-gray-50/50 dark:bg-[#1F1F23]/50">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Promedios del período</span>
                </div>
                {loading
                    ? <Skeleton className="h-5 w-20" />
                    : totalSnapshots != null && (
                        <span className="text-xs text-gray-400">{totalSnapshots} snapshots</span>
                    )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-[#1F1F23]">
                {metrics.map(({ label, icon: Icon, value, unit }) => (
                    <div key={label} className="px-4 py-3 space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1.5">
                                <Icon className="h-3.5 w-3.5" />
                                {label}
                            </div>
                            {loading
                                ? <Skeleton className="h-4 w-10" />
                                : <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {value != null ? `${fmt(value)}${unit}` : '—'}
                                  </span>}
                        </div>
                        {loading
                            ? <Skeleton className="h-1.5 w-full rounded-full" />
                            : <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${usageColor(value)}`}
                                    style={{ width: `${Math.min(value ?? 0, 100)}%` }}
                                />
                              </div>}
                    </div>
                ))}
            </div>
            {avgTemp != null && !loading && (
                <div className="px-4 py-2 border-t border-gray-100 dark:border-[#1F1F23] text-xs text-gray-500">
                    Temperatura CPU promedio: <span className="font-medium text-gray-900 dark:text-gray-100">{fmt(avgTemp)}°C</span>
                </div>
            )}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PerformanceHistoryPage() {
    const { equipmentId } = useParams<{ equipmentId: string }>();
    const navigate = useNavigate();
    const id = Number(equipmentId);

    const { data: equipment, loading: equipmentLoading } = useEquipmentById(id);
    const [rangeDays, setRangeDays] = useState(7);

    const { from, to } = useMemo(() => {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - rangeDays);
        return { from, to };
    }, [rangeDays]);

    const { history, loading } = usePerformanceHistory(id, from, to);
    const { averages, loading: avgLoading } = usePerformanceAverages(id, from, to);

    return (
        <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-2 -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="mr-1.5 h-4 w-4" />
                        Volver
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <Activity className="h-8 w-8 text-primary" />
                        Historial de Rendimiento
                    </h1>
                    {equipmentLoading ? (
                        <Skeleton className="h-4 w-48 mt-1" />
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {equipment
                                ? `${equipment.name} — ${equipment.code}`
                                : 'Equipo no encontrado'}
                        </p>
                    )}
                </div>

                {/* Range selector */}
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    {RANGE_OPTIONS.map((opt) => (
                        <Button
                            key={opt.days}
                            variant={rangeDays === opt.days ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setRangeDays(opt.days)}
                        >
                            {opt.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Averages summary */}
            <AveragesCard
                avgCpu={averages?.avgCpuUsagePercent}
                avgRam={averages?.avgRamUsagePercent}
                avgDisk={averages?.avgDiskUsagePercent}
                avgTemp={averages?.avgCpuTemperatureC}
                totalSnapshots={averages?.totalSnapshots}
                loading={avgLoading}
            />

            {/* Snapshot accordion */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full rounded-xl" />
                    ))}
                </div>
            ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Activity className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm">Sin snapshots de rendimiento en el rango seleccionado.</p>
                </div>
            ) : (
                <Accordion type="multiple" className="space-y-3">
                    {history.map((snap, index) => {
                        const date = new Date(snap.capturedAt);
                        const isFirst = index === 0;
                        const alerts = [
                            snap.hasCpuAlert && 'CPU',
                            snap.hasRamAlert && 'RAM',
                            snap.hasDiskAlert && 'Disco',
                            snap.hasThermalAlert && 'Temp',
                        ].filter(Boolean) as string[];
                        const hasAlert = alerts.length > 0;

                        return (
                            <AccordionItem
                                key={snap.id}
                                value={String(snap.id)}
                                className="rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] overflow-hidden"
                            >
                                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50/50 dark:hover:bg-[#1F1F23]/30">
                                    <div className="flex items-center gap-3 flex-wrap w-full pr-2">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {hasAlert
                                                ? <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                                                : <Activity className="h-4 w-4 text-emerald-500 shrink-0" />}
                                            {date.toLocaleString()}
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap ml-auto mr-2">
                                            {isFirst && (
                                                <Badge className="text-[11px] px-2 py-0 bg-primary/10 text-primary border-primary/20">
                                                    Más reciente
                                                </Badge>
                                            )}
                                            <Badge variant="secondary" className="text-[11px] px-2 py-0 capitalize">
                                                {snap.mode}
                                            </Badge>
                                            {alerts.map(a => (
                                                <Badge key={a} variant="outline" className="text-[11px] px-2 py-0 text-red-600 border-red-200 dark:border-red-800">
                                                    {a}
                                                </Badge>
                                            ))}
                                        </div>

                                        {/* Quick metrics */}
                                        <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 shrink-0">
                                            {snap.cpuUsagePercent != null && (
                                                <span className="flex items-center gap-1">
                                                    <Cpu className="h-3 w-3" />
                                                    {fmt(snap.cpuUsagePercent, 0)}%
                                                </span>
                                            )}
                                            {snap.ramUsagePercent != null && (
                                                <span className="flex items-center gap-1">
                                                    <MemoryStick className="h-3 w-3" />
                                                    {fmt(snap.ramUsagePercent, 0)}%
                                                </span>
                                            )}
                                            {snap.diskUsagePercent != null && (
                                                <span className="flex items-center gap-1">
                                                    <HardDrive className="h-3 w-3" />
                                                    {fmt(snap.diskUsagePercent, 0)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4 pt-0">
                                    <PerformanceSnapshot snapshot={snap} />
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            )}
        </div>
    );
}
