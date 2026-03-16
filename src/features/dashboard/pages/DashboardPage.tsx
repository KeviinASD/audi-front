import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEquipments } from '@/features/equipos/hooks/useEquipment';
import { useLaboratories } from '@/features/equipos/hooks/useLaboratory';
import {
    useSecurityRisks,
    useEquipmentsWithoutAntivirus,
    useEquipmentsWithPendingUpdates,
} from '@/features/security/hooks/useSecurity';
import { usePerformanceAlerts } from '@/features/performance/hooks/usePerformance';
import { DashboardFilters, ChartDistributionByStatus, ChartEquipmentsByLaboratory } from '../components';
import type { DashboardLabFilter, DashboardStatusFilter } from '../components';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Monitor,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    WifiOff,
    ShieldAlert,
    ShieldOff,
    RefreshCw,
    Cpu,
    MemoryStick,
    HardDrive,
    Thermometer,
    MapPin,
    Clock,
    Building2,
    LayoutDashboard,
    ArrowRight,
    Activity,
    RotateCcw,
    TrendingUp,
} from 'lucide-react';
import type { EquipmentResponse } from '@/features/equipos/interfaces';
import { equipmentsWithDisplayStatus } from '@/features/equipos/utils/equipment-status';

// ── helpers ───────────────────────────────────────────────────────────────────

/**
 * Backend returns SecuritySnapshot[] / PerformanceSnapshot[] with nested `equipment`.
 * Frontend types are flat (SecurityRiskEquipmentResponse, PerformanceAlertEquipmentResponse).
 * This helper safely resolves equipment data from either structure.
 */
function resolveEq(item: any): { id: number; name: string; code: string; ubication?: string; status: string; lab?: string } {
    const eq = item?.equipment ?? item;
    return {
        id:        eq?.id        ?? item?.id        ?? 0,
        name:      eq?.name      ?? item?.name      ?? '—',
        code:      eq?.code      ?? item?.code      ?? '—',
        ubication: eq?.ubication ?? item?.ubication,
        status:    eq?.status    ?? item?.status    ?? 'sin-datos',
        lab:       eq?.laboratory?.name,
    };
}

function fmtDate(iso?: string | null) {
    if (!iso) return 'Nunca';
    return new Date(iso).toLocaleString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

const STATUS_MAP = {
    operativo:   { label: 'Operativo',  bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
    conectado:   { label: 'Conectado',  bg: 'bg-sky-100     dark:bg-sky-900/30',     text: 'text-sky-700    dark:text-sky-400'     },
    degradado:   { label: 'Degradado',  bg: 'bg-amber-100  dark:bg-amber-900/30',   text: 'text-amber-700  dark:text-amber-400'   },
    critico:     { label: 'Crítico',    bg: 'bg-red-100    dark:bg-red-900/30',     text: 'text-red-700    dark:text-red-400'     },
    'sin-datos': { label: 'Sin datos',  bg: 'bg-gray-100   dark:bg-gray-800',       text: 'text-gray-500   dark:text-gray-400'   },
} as const;

function StatusPill({ status }: { status: string }) {
    const s = STATUS_MAP[status as keyof typeof STATUS_MAP] ?? STATUS_MAP['sin-datos'];
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
            {s.label}
        </span>
    );
}

// ── reusable primitives ───────────────────────────────────────────────────────

function Card({ children, className = '', onClick }: {
    children: React.ReactNode; className?: string; onClick?: () => void;
}) {
    return (
        <div
            className={`rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

function SectionLabel({ title, subtitle, linkTo, linkLabel }: {
    title: string; subtitle?: string; linkTo?: string; linkLabel?: string;
}) {
    const navigate = useNavigate();
    return (
        <div className="flex items-start justify-between mb-3">
            <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</p>
                {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
            {linkTo && (
                <Button variant="ghost" size="sm" className="text-xs h-7 gap-1 -mt-0.5 shrink-0"
                    onClick={() => navigate(linkTo)}>
                    {linkLabel ?? 'Ver todo'} <ArrowRight className="h-3 w-3" />
                </Button>
            )}
        </div>
    );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({ label, value, icon: Icon, accent, loading }: {
    label: string; value: number; icon: React.ElementType;
    accent: { border: string; iconBg: string; iconColor: string; valueColor: string };
    loading: boolean;
}) {
    return (
        <Card className={`p-5 flex flex-col gap-3 ${accent.border}`}>
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${accent.iconBg}`}>
                    <Icon className={`h-4 w-4 ${accent.iconColor}`} />
                </div>
            </div>
            {loading
                ? <Skeleton className="h-8 w-14" />
                : <p className={`text-3xl font-bold leading-none ${accent.valueColor}`}>{value}</p>
            }
        </Card>
    );
}

// ── Metric tile ───────────────────────────────────────────────────────────────

function MetricTile({ label, value, icon: Icon, accent, loading, onClick }: {
    label: string; value: number; icon: React.ElementType;
    accent: { border: string; iconColor: string; textColor: string };
    loading: boolean;
    onClick?: () => void;
}) {
    const content = (
        <>
            <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${accent.iconColor}`} />
                <span className={`text-xs font-semibold ${accent.textColor}`}>{label}</span>
            </div>
            {loading
                ? <Skeleton className="h-6 w-8" />
                : <span className={`text-xl font-bold ${accent.textColor}`}>{value}</span>
            }
        </>
    );
    return (
        <Card className={`p-4 flex items-center justify-between ${accent.border} ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`} onClick={onClick}>
            {content}
        </Card>
    );
}

// ── Equipment mini row ────────────────────────────────────────────────────────

function EqRow({ item, onNavigate, iconBg, iconColor }: {
    item: any; onNavigate: (id: number) => void;
    iconBg: string; iconColor: string;
}) {
    const eq = resolveEq(item);
    return (
        <div className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#1F1F23]/50 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Monitor className={`h-3.5 w-3.5 ${iconColor}`} />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{eq.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{eq.code}</p>
                </div>
            </div>
            <button
                onClick={() => onNavigate(eq.id)}
                className="text-xs text-primary hover:underline flex items-center gap-0.5 shrink-0 ml-2"
            >
                Ver <ArrowRight className="h-2.5 w-2.5" />
            </button>
        </div>
    );
}

// ── Performance mini row ──────────────────────────────────────────────────────

function PerfRow({ item, onNavigate }: { item: any; onNavigate: (id: number) => void }) {
    const eq = resolveEq(item);
    return (
        <div className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#1F1F23]/50 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-7 w-7 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                    <Activity className="h-3.5 w-3.5 text-orange-500" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{eq.name}</p>
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                        {item.hasCpuAlert     && <span className="px-1 text-[9px] bg-red-100    text-red-600    dark:bg-red-900/30    dark:text-red-400    rounded font-bold">CPU</span>}
                        {item.hasRamAlert     && <span className="px-1 text-[9px] bg-amber-100  text-amber-600  dark:bg-amber-900/30  dark:text-amber-400  rounded font-bold">RAM</span>}
                        {item.hasDiskAlert    && <span className="px-1 text-[9px] bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 rounded font-bold">Disco</span>}
                        {item.hasThermalAlert && <span className="px-1 text-[9px] bg-rose-100   text-rose-600   dark:bg-rose-900/30   dark:text-rose-400   rounded font-bold">Temp</span>}
                    </div>
                </div>
            </div>
            <button
                onClick={() => onNavigate(eq.id)}
                className="text-xs text-primary hover:underline flex items-center gap-0.5 shrink-0 ml-2"
            >
                Ver <ArrowRight className="h-2.5 w-2.5" />
            </button>
        </div>
    );
}

// ── List card ─────────────────────────────────────────────────────────────────

function ListCard({ title, icon: Icon, headerCls, items, loading, emptyMsg, renderRow, moreCount, onMore }: {
    title: string; icon: React.ElementType; headerCls: string;
    items: any[]; loading: boolean; emptyMsg: string;
    renderRow: (item: any) => React.ReactNode;
    moreCount?: number; onMore?: () => void;
}) {
    return (
        <Card className="mt-3 overflow-hidden">
            <div className={`flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-[#1F1F23] ${headerCls}`}>
                <Icon className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">{title}</span>
            </div>
            {loading ? (
                <div className="space-y-2 p-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
                </div>
            ) : items.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-5 px-4">{emptyMsg}</p>
            ) : (
                <div className="divide-y divide-gray-50 dark:divide-[#1F1F23]/60">
                    {items.slice(0, 4).map((item, i) => <div key={i}>{renderRow(item)}</div>)}
                    {moreCount !== undefined && moreCount > 0 && (
                        <div className="px-4 py-2.5 text-center">
                            <button onClick={onMore} className="text-xs text-primary hover:underline">
                                + {moreCount} más — ver todos
                            </button>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}

// ── Labs overview ─────────────────────────────────────────────────────────────

type LabStatItem = {
    lab: { id: number; name: string; location?: string };
    total: number;
    operative: number;
    conectado: number;
    degraded: number;
    critical: number;
    noData: number;
};

function LabOverview({ equipments, laboratories, loading }: {
    equipments: (EquipmentResponse & { displayStatus?: string })[]; laboratories: any[]; loading: boolean;
}) {
    const labStats = useMemo((): LabStatItem[] => {
        const list: LabStatItem[] = [];
        laboratories.forEach((lab) => {
            const eqs = equipments.filter(e => e.laboratory?.id === lab.id);
            if (eqs.length === 0) return;
            const getStatus = (e: (typeof equipments)[number]) => e.displayStatus ?? e.status;
            list.push({
                lab,
                total:     eqs.length,
                operative: eqs.filter(e => getStatus(e) === 'operativo').length,
                conectado: eqs.filter(e => getStatus(e) === 'conectado').length,
                degraded:  eqs.filter(e => getStatus(e) === 'degradado').length,
                critical:  eqs.filter(e => getStatus(e) === 'critico').length,
                noData:    eqs.filter(e => getStatus(e) === 'sin-datos').length,
            });
        });
        return list;
    }, [equipments, laboratories]);

    if (loading || labStats.length === 0) return null;

    return (
        <div>
            <SectionLabel title="Estado por laboratorio" subtitle="Distribución de equipos en cada sala" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {labStats.map(({ lab, total, operative, conectado, degraded, critical, noData }) => (
                    <Card key={lab.id} className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{lab.name}</p>
                                {lab.location && (
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                                        <MapPin className="h-2.5 w-2.5 shrink-0" /> {lab.location}
                                    </p>
                                )}
                            </div>
                            <Badge variant="secondary" className="text-xs shrink-0">{total} eq.</Badge>
                        </div>
                        <div className="flex h-1.5 w-full rounded-full overflow-hidden gap-px bg-gray-100 dark:bg-gray-800 mb-2">
                            {operative > 0 && <div className="bg-emerald-500" style={{ width: `${(operative/total)*100}%` }} />}
                            {conectado  > 0 && <div className="bg-sky-400"     style={{ width: `${(conectado /total)*100}%` }} />}
                            {degraded  > 0 && <div className="bg-amber-400"   style={{ width: `${(degraded /total)*100}%` }} />}
                            {critical  > 0 && <div className="bg-red-500"     style={{ width: `${(critical /total)*100}%` }} />}
                            {noData    > 0 && <div className="bg-gray-300 dark:bg-gray-600" style={{ width: `${(noData/total)*100}%` }} />}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-semibold">
                            {operative > 0 && <span className="text-emerald-600 dark:text-emerald-400">{operative} operativos</span>}
                            {conectado  > 0 && <span className="text-sky-600    dark:text-sky-400"   >{conectado}  conectados</span>}
                            {degraded  > 0 && <span className="text-amber-600  dark:text-amber-400" >{degraded}  degradados</span>}
                            {critical  > 0 && <span className="text-red-600    dark:text-red-400"   >{critical}  críticos</span>}
                            {noData    > 0 && <span className="text-gray-400"                        >{noData}    sin datos</span>}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ═════════════════════════════════════════════════════════════════════════════

export default function DashboardPage() {
    const navigate = useNavigate();

    const [selectedLabId, setSelectedLabId] = useState<DashboardLabFilter>('all');
    const [statusFilter, setStatusFilter] = useState<DashboardStatusFilter>('all');
    const [securityListTab, setSecurityListTab] = useState<'risk' | 'noAv' | 'pending'>('risk');

    const { laboratories, loading: labsLoading } = useLaboratories();
    const { equipments, loading: eqLoading }      = useEquipments(
        selectedLabId !== 'all' ? { labId: selectedLabId } : undefined
    );

    const equipmentsWithStatus = useMemo(() => equipmentsWithDisplayStatus(equipments), [equipments]);

    const equipmentsFiltered = useMemo(() => {
        if (statusFilter === 'all') return equipmentsWithStatus;
        return equipmentsWithStatus.filter((e) => e.displayStatus === statusFilter);
    }, [equipmentsWithStatus, statusFilter]);

    const { equipments: secRisks,   loading: srLoading,   refetch: refetchSecRisks } = useSecurityRisks();
    const { equipments: noAv,       loading: naLoading,   refetch: refetchNoAv } = useEquipmentsWithoutAntivirus();
    const { equipments: pendingUpd, loading: puLoading,   refetch: refetchPendingUpd } = useEquipmentsWithPendingUpdates();
    const { equipments: perfAlerts, loading: paLoading } = usePerformanceAlerts();

    const stats = useMemo(() => ({
        total:     equipmentsFiltered.length,
        operative: equipmentsFiltered.filter(e => e.displayStatus === 'operativo').length,
        conectado: equipmentsFiltered.filter(e => e.displayStatus === 'conectado').length,
        degraded:  equipmentsFiltered.filter(e => e.displayStatus === 'degradado').length,
        critical:  equipmentsFiltered.filter(e => e.displayStatus === 'critico').length,
        noData:    equipmentsFiltered.filter(e => e.displayStatus === 'sin-datos').length,
    }), [equipmentsFiltered]);

    const perfStats = useMemo(() => ({
        cpu:  perfAlerts.filter(e => e.hasCpuAlert).length,
        ram:  perfAlerts.filter(e => e.hasRamAlert).length,
        disk: perfAlerts.filter(e => e.hasDiskAlert).length,
        temp: perfAlerts.filter(e => e.hasThermalAlert).length,
    }), [perfAlerts]);

    const recentEquipments = useMemo(() =>
        [...equipmentsFiltered]
            .filter(e => e.lastConnection)
            .sort((a, b) => new Date(b.lastConnection!).getTime() - new Date(a.lastConnection!).getTime())
            .slice(0, 10),
        [equipmentsFiltered]
    );

    const criticalFirst = useMemo(() =>
        [...equipmentsFiltered]
            .filter(e => e.displayStatus === 'critico' || e.displayStatus === 'degradado')
            .sort((a, b) => (a.displayStatus === 'critico' && b.displayStatus !== 'critico' ? -1 : a.displayStatus !== 'critico' && b.displayStatus === 'critico' ? 1 : 0)),
        [equipmentsFiltered]
    );

    // Seguridad: aplicar filtro de laboratorio para que cuadre con el resto del panel
    const filterByLab = (list: any[]) => {
        if (selectedLabId === 'all') return list;
        return list.filter((r) => equipmentsWithStatus.some((e) => e.id === resolveEq(r).id));
    };
    const secRisksFiltered = useMemo(() => filterByLab(secRisks), [secRisks, selectedLabId, equipmentsWithStatus]);
    const noAvFiltered = useMemo(() => filterByLab(noAv), [noAv, selectedLabId, equipmentsWithStatus]);
    const pendingUpdFiltered = useMemo(() => filterByLab(pendingUpd), [pendingUpd, selectedLabId, equipmentsWithStatus]);

    // Requieren atención: unión de equipos por estado (crítico/degradado) y por riesgo de seguridad
    type AttentionItem = (typeof equipmentsWithStatus)[number] & { attentionReasons: string[] };
    const securityRiskIds = useMemo(() => new Set(secRisksFiltered.map((r) => resolveEq(r).id)), [secRisksFiltered]);
    const attentionList = useMemo((): AttentionItem[] => {
        const ids = new Set([
            ...criticalFirst.map((e) => e.id),
            ...Array.from(securityRiskIds),
        ]);
        const list = equipmentsWithStatus.filter((e) => ids.has(e.id));
        return list
            .map((e) => ({
                ...e,
                attentionReasons: [
                    (e.displayStatus === 'critico' || e.displayStatus === 'degradado') && 'Estado',
                    securityRiskIds.has(e.id) && 'Seguridad',
                ].filter(Boolean) as string[],
            }))
            .sort((a, b) => {
                const score = (x: AttentionItem) => (x.displayStatus === 'critico' ? 2 : x.displayStatus === 'degradado' ? 1 : 0);
                return score(b) - score(a);
            });
    }, [equipmentsWithStatus, criticalFirst, securityRiskIds]);

    const selectedLab = laboratories.find(l => l.id === (selectedLabId === 'all' ? undefined : selectedLabId));
    const hasActiveFilters = selectedLabId !== 'all' || statusFilter !== 'all';
    const handleClearFilters = () => {
        setSelectedLabId('all');
        setStatusFilter('all');
    };

    const today = new Date().toLocaleDateString('es-PE', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <div className="flex flex-col gap-7 p-6 max-w-screen-2xl mx-auto animate-in fade-in duration-300">

            {/* ── HEADER ─────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <LayoutDashboard className="h-6 w-6 text-primary" />
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                                Panel de Control
                            </h1>
                        </div>
                        <p className="text-sm text-gray-400 mt-1 capitalize">{today}</p>
                    </div>
                </div>
                <DashboardFilters
                    labId={selectedLabId}
                    onLabChange={setSelectedLabId}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    laboratories={laboratories}
                    labsLoading={labsLoading}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={handleClearFilters}
                />
                {selectedLab && (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary font-medium px-3 py-1.5 rounded-full">
                            <Building2 className="h-3 w-3" />
                            {selectedLab.name}
                            {selectedLab.location && <span className="text-primary/60 ml-1">— {selectedLab.location}</span>}
                        </div>
                    </div>
                )}
            </div>

            {/* ── KPI: EQUIPMENT STATUS ───────────────────────────────────── */}
            {/* ── ESTADO DE EQUIPOS: una sola sección clara (KPIs + gráficos) ───── */}
            <div className="space-y-4">
                <SectionLabel
                    title="Estado de Equipos"
                    subtitle="Evaluación del último snapshot (hardware y seguridad). Los gráficos reflejan los filtros aplicados."
                    linkTo="/main/equipos"
                    linkLabel="Ver catálogo"
                />
                {!eqLoading && stats.total > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#1F1F23] rounded-lg px-3 py-2 border border-gray-100 dark:border-[#1F1F23]">
                        <strong>Cuadre:</strong> Total {stats.total} equipos. Por estado: {stats.operative} Operativos + {stats.conectado} Conectados + {stats.degraded} Degradados + {stats.noData} Sin datos. <strong>Con riesgo: {secRisksFiltered.length}</strong> (mismo total que en Seguridad).
                    </p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <KpiCard label="Total"       value={stats.total}     icon={Monitor}       loading={eqLoading}
                        accent={{ border: 'border-gray-200 dark:border-[#1F1F23]', iconBg: 'bg-gray-100 dark:bg-gray-800', iconColor: 'text-gray-500', valueColor: 'text-gray-900 dark:text-gray-100' }} />
                    <KpiCard label="Operativos"  value={stats.operative} icon={CheckCircle2}  loading={eqLoading}
                        accent={{ border: 'border-emerald-200 dark:border-emerald-900/40', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400', valueColor: 'text-emerald-700 dark:text-emerald-400' }} />
                    <KpiCard label="Conectados"  value={stats.conectado} icon={Activity}      loading={eqLoading}
                        accent={{ border: 'border-sky-200 dark:border-sky-900/40', iconBg: 'bg-sky-100 dark:bg-sky-900/30', iconColor: 'text-sky-600 dark:text-sky-400', valueColor: 'text-sky-700 dark:text-sky-400' }} />
                    <KpiCard label="Degradados"  value={stats.degraded}  icon={AlertTriangle} loading={eqLoading}
                        accent={{ border: 'border-amber-200 dark:border-amber-900/40', iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400', valueColor: 'text-amber-700 dark:text-amber-400' }} />
                    <KpiCard label="Con riesgo" value={secRisksFiltered.length} icon={XCircle} loading={eqLoading || srLoading}
                        accent={{ border: 'border-red-200 dark:border-red-900/40', iconBg: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-600 dark:text-red-400', valueColor: 'text-red-700 dark:text-red-400' }} />
                    <KpiCard label="Sin datos"   value={stats.noData}   icon={WifiOff}       loading={eqLoading}
                        accent={{ border: 'border-gray-200 dark:border-[#1F1F23]', iconBg: 'bg-gray-100 dark:bg-gray-800', iconColor: 'text-gray-400', valueColor: 'text-gray-500 dark:text-gray-400' }} />
                </div>

                {/*{!eqLoading && equipmentsFiltered.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-5">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Por estado</p>
                            <ChartDistributionByStatus equipments={equipmentsFiltered} loading={eqLoading} />
                        </Card>
                        <Card className="p-5">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Por laboratorio</p>
                            <ChartEquipmentsByLaboratory
                                equipments={equipmentsFiltered}
                                laboratories={laboratories}
                                loading={eqLoading}
                            />
                        </Card>
                    </div>
                )}*/}
            </div>

            {/* ── SECURITY + PERFORMANCE ─────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-7">

                {/* Security */}
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Seguridad</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Mismo total que arriba: Con riesgo. Refresca o filtra por tipo.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs rounded-xl"
                                onClick={() => { refetchSecRisks(); refetchNoAv(); refetchPendingUpd(); }}
                                disabled={srLoading || naLoading || puLoading}
                            >
                                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${(srLoading || naLoading || puLoading) ? 'animate-spin' : ''}`} />
                                Refrescar
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-xs rounded-xl" onClick={() => navigate('/main/security')}>
                                Ver detalle <ArrowRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                        <MetricTile label="Con riesgo" value={secRisksFiltered.length} icon={ShieldAlert} loading={srLoading}
                            accent={{ border: 'border-red-200 dark:border-red-900/40', iconColor: 'text-red-500', textColor: 'text-red-600 dark:text-red-400' }}
                            onClick={() => setSecurityListTab('risk')} />
                        <MetricTile label="Sin antivirus" value={noAvFiltered.length} icon={ShieldOff} loading={naLoading}
                            accent={{ border: 'border-amber-200  dark:border-amber-900/40',  iconColor: 'text-amber-500',  textColor: 'text-amber-600  dark:text-amber-400'  }}
                            onClick={() => setSecurityListTab('noAv')} />
                        <MetricTile label="Act. crítica" value={pendingUpdFiltered.length} icon={RefreshCw} loading={puLoading}
                            accent={{ border: 'border-orange-200 dark:border-orange-900/40', iconColor: 'text-orange-500', textColor: 'text-orange-600 dark:text-orange-400' }}
                            onClick={() => setSecurityListTab('pending')} />
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-[#1F1F23] w-fit">
                        {[
                            { key: 'risk' as const, label: 'Con riesgo', icon: ShieldAlert },
                            { key: 'noAv' as const, label: 'Sin antivirus', icon: ShieldOff },
                            { key: 'pending' as const, label: 'Act. crítica', icon: RefreshCw },
                        ].map(({ key, label, icon: TabIcon }) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setSecurityListTab(key)}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                    securityListTab === key
                                        ? 'bg-white dark:bg-[#16161a] text-gray-900 dark:text-gray-100 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            >
                                <TabIcon className="h-3.5 w-3.5" />
                                {label}
                            </button>
                        ))}
                    </div>
                    {(() => {
                        const config = {
                            risk: { items: secRisksFiltered, loading: srLoading, title: 'Equipos con riesgo activo', emptyMsg: 'Ningún equipo con riesgos de seguridad activos.', icon: ShieldAlert, headerCls: 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400' },
                            noAv: { items: noAvFiltered, loading: naLoading, title: 'Equipos sin antivirus', emptyMsg: 'Todos los equipos tienen antivirus activo.', icon: ShieldOff, headerCls: 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400' },
                            pending: { items: pendingUpdFiltered, loading: puLoading, title: 'Equipos con actualización crítica pendiente', emptyMsg: 'No hay actualizaciones críticas pendientes.', icon: RefreshCw, headerCls: 'bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-400' },
                        };
                        const c = config[securityListTab];
                        return (
                            <ListCard
                                title={c.title}
                                icon={c.icon}
                                headerCls={c.headerCls}
                                items={c.items}
                                loading={c.loading}
                                emptyMsg={c.emptyMsg}
                                renderRow={(item) => (
                                    <EqRow item={item}
                                        onNavigate={id => navigate(`/main/security/historial/${id}`)}
                                        iconBg="bg-red-50 dark:bg-red-900/20"
                                        iconColor="text-red-500"
                                    />
                                )}
                                moreCount={c.items.length > 4 ? c.items.length - 4 : 0}
                                onMore={() => navigate('/main/security')}
                            />
                        );
                    })()}
                </div>

                {/* Performance */}
                {/*<div>
                    <SectionLabel
                        title="Rendimiento"
                        subtitle="Alertas de métricas fuera de los límites aceptables"
                        linkTo="/main/performance"
                        linkLabel="Ver detalle"
                    />
                    <div className="grid grid-cols-2 gap-2.5">
                        <MetricTile label="CPU"         value={perfStats.cpu}  icon={Cpu}         loading={paLoading}
                            accent={{ border: 'border-red-200    dark:border-red-900/40',    iconColor: 'text-red-500',    textColor: 'text-red-600    dark:text-red-400'    }} />
                        <MetricTile label="RAM"         value={perfStats.ram}  icon={MemoryStick} loading={paLoading}
                            accent={{ border: 'border-amber-200  dark:border-amber-900/40',  iconColor: 'text-amber-500',  textColor: 'text-amber-600  dark:text-amber-400'  }} />
                        <MetricTile label="Disco"       value={perfStats.disk} icon={HardDrive}   loading={paLoading}
                            accent={{ border: 'border-orange-200 dark:border-orange-900/40', iconColor: 'text-orange-500', textColor: 'text-orange-600 dark:text-orange-400' }} />
                        <MetricTile label="Temperatura" value={perfStats.temp} icon={Thermometer} loading={paLoading}
                            accent={{ border: 'border-rose-200   dark:border-rose-900/40',   iconColor: 'text-rose-500',   textColor: 'text-rose-600   dark:text-rose-400'   }} />
                    </div>
                    <ListCard
                        title="Equipos con alertas activas"
                        icon={Activity}
                        headerCls="bg-gray-50 dark:bg-[#1F1F23]/60 text-gray-600 dark:text-gray-400"
                        items={perfAlerts}
                        loading={paLoading}
                        emptyMsg="Ningún equipo con alertas de rendimiento activas."
                        renderRow={(item) => (
                            <PerfRow item={item}
                                onNavigate={id => navigate(`/main/performance/historial/${id}`)}
                            />
                        )}
                        moreCount={perfAlerts.length > 4 ? perfAlerts.length - 4 : 0}
                        onMore={() => navigate('/main/performance')}
                    />
                </div>*/}
            </div>

            {/* ── LABS OVERVIEW (only when showing all labs) ──────────────── */}
            {!selectedLabId && (
                <LabOverview
                    equipments={equipmentsWithStatus}
                    laboratories={laboratories}
                    loading={eqLoading || labsLoading}
                />
            )}

            {/* ── REQUIRES ATTENTION (estado crítico/degradado O riesgo seguridad) ───────── */}
            {!eqLoading && attentionList.length > 0 && (
                <div>
                    <SectionLabel
                        title="Requieren atención"
                        subtitle={`${attentionList.length} equipo(s) que requieren acción (estado crítico/degradado o riesgo de seguridad). Coincide con la sección Seguridad cuando todos tienen riesgo.`}
                        linkTo="/main/equipos"
                        linkLabel="Ver catálogo"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {attentionList.map((eq) => (
                            <Card key={eq.id}
                                className="p-4 hover:border-primary/40 cursor-pointer transition-all group"
                                onClick={() => navigate('/main/equipos')}
                            >
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                                            eq.displayStatus === 'critico' ? 'bg-red-50 dark:bg-red-900/20' : eq.displayStatus === 'degradado' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50/50 dark:bg-red-900/10'
                                        }`}>
                                            <Monitor className={`h-4 w-4 ${eq.displayStatus === 'critico' ? 'text-red-500' : eq.displayStatus === 'degradado' ? 'text-amber-500' : 'text-red-400'}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors truncate">
                                                {eq.name}
                                            </p>
                                            <p className="text-xs font-mono text-gray-400">{eq.code}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        {eq.attentionReasons.length > 0 ? (
                                            <div className="flex flex-wrap gap-1 justify-end">
                                                {eq.attentionReasons.map((r) => (
                                                    <span key={r} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                        {r}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : null}
                                        <StatusPill status={eq.displayStatus} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span className="flex items-center gap-1 truncate">
                                        <MapPin className="h-3 w-3 shrink-0" />
                                        {eq.ubication || 'Sin ubicación'}
                                    </span>
                                    {eq.laboratory && (
                                        <span className="flex items-center gap-1 shrink-0 ml-2">
                                            <Building2 className="h-3 w-3" />
                                            {eq.laboratory.name}
                                        </span>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* ── RECENT CONNECTIONS ──────────────────────────────────────── */}
            <div>
                <SectionLabel
                    title="Últimas conexiones"
                    subtitle="Equipos ordenados por fecha del último snapshot recibido"
                    linkTo="/main/equipos"
                    linkLabel="Ver catálogo"
                />
                <Card className="overflow-hidden">
                    {eqLoading ? (
                        <div className="space-y-3 p-4">
                            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                    ) : recentEquipments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14 text-gray-400 gap-2">
                            <WifiOff className="h-10 w-10 opacity-30" />
                            <p className="text-sm font-medium">Ningún equipo ha enviado datos aún</p>
                            <p className="text-xs opacity-70">Los equipos aparecerán aquí una vez que el agente envíe snapshots</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-[#1F1F23]/60">
                                <TableRow>
                                    <TableHead>Equipo</TableHead>
                                    <TableHead className="hidden sm:table-cell">Laboratorio</TableHead>
                                    <TableHead className="hidden md:table-cell">Ubicación</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="hidden lg:table-cell">
                                        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Última conexión</span>
                                    </TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentEquipments.map(eq => (
                                    <TableRow key={eq.id} className="hover:bg-gray-50/60 dark:hover:bg-[#1F1F23]/40 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-[#1F1F23] flex items-center justify-center shrink-0">
                                                    <Monitor className="h-4 w-4 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{eq.name}</p>
                                                    <p className="text-xs text-gray-400 font-mono">{eq.code}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <Building2 className="h-3 w-3 shrink-0" />
                                                {eq.laboratory?.name ?? <span className="italic text-xs text-gray-400">Sin asignar</span>}
                                            </span>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <MapPin className="h-3 w-3 shrink-0" />
                                                {eq.ubication || <span className="italic text-xs text-gray-400">Sin ubicación</span>}
                                            </span>
                                        </TableCell>
                                        <TableCell><StatusPill status={eq.displayStatus} /></TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm text-gray-500">
                                            {fmtDate(eq.lastConnection)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"
                                                    onClick={() => navigate(`/main/analysis/equipo/${eq.id}`)}>
                                                    <TrendingUp className="h-3 w-3 mr-1" /> Análisis
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"
                                                    onClick={() => navigate(`/main/hardware/historial/${eq.id}`)}>
                                                    <RotateCcw className="h-3 w-3 mr-1" /> Historial
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </Card>
            </div>

        </div>
    );
}
