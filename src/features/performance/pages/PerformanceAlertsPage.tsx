import { useNavigate } from 'react-router-dom';
import { usePerformanceAlerts } from '../hooks/usePerformance';
import type { PerformanceAlertEquipmentResponse } from '../interfaces';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Activity,
    AlertTriangle,
    Monitor,
    MapPin,
    History,
    Eye,
    Cpu,
    MemoryStick,
    HardDrive,
    Thermometer,
} from 'lucide-react';

// ── Alert badges ──────────────────────────────────────────────────────────────

function AlertBadges({ eq }: { eq: PerformanceAlertEquipmentResponse }) {
    return (
        <div className="flex items-center gap-1.5 flex-wrap">
            {eq.hasCpuAlert && (
                <Badge variant="outline" className="text-[11px] px-1.5 py-0 text-red-600 border-red-200 dark:border-red-800 flex items-center gap-1">
                    <Cpu className="h-2.5 w-2.5" /> CPU
                </Badge>
            )}
            {eq.hasRamAlert && (
                <Badge variant="outline" className="text-[11px] px-1.5 py-0 text-amber-600 border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    <MemoryStick className="h-2.5 w-2.5" /> RAM
                </Badge>
            )}
            {eq.hasDiskAlert && (
                <Badge variant="outline" className="text-[11px] px-1.5 py-0 text-orange-600 border-orange-200 dark:border-orange-800 flex items-center gap-1">
                    <HardDrive className="h-2.5 w-2.5" /> Disco
                </Badge>
            )}
            {eq.hasThermalAlert && (
                <Badge variant="outline" className="text-[11px] px-1.5 py-0 text-rose-600 border-rose-200 dark:border-rose-800 flex items-center gap-1">
                    <Thermometer className="h-2.5 w-2.5" /> Temp
                </Badge>
            )}
        </div>
    );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ count, label, icon: Icon, accentClass, loading }: {
    count: number;
    label: string;
    icon: React.ElementType;
    accentClass: string;
    loading: boolean;
}) {
    return (
        <div className={`p-4 rounded-xl border ${accentClass}`}>
            <div className="flex items-center gap-1.5 text-sm font-medium mb-1">
                <Icon className="h-4 w-4" />
                {label}
            </div>
            {loading
                ? <Skeleton className="h-7 w-8 mt-1" />
                : <div className="text-2xl font-bold">{count}</div>}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PerformanceAlertsPage() {
    const navigate = useNavigate();
    const { equipments, loading } = usePerformanceAlerts();

    const cpuCount  = equipments.filter(e => e.hasCpuAlert).length;
    const ramCount  = equipments.filter(e => e.hasRamAlert).length;
    const diskCount = equipments.filter(e => e.hasDiskAlert).length;
    const tempCount = equipments.filter(e => e.hasThermalAlert).length;

    return (
        <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <Activity className="h-8 w-8 text-primary" />
                    Alertas de Rendimiento
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Equipos con métricas de rendimiento fuera de los límites aceptables.
                </p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    count={cpuCount} label="CPU" icon={Cpu} loading={loading}
                    accentClass="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 text-red-700 dark:text-red-400"
                />
                <StatCard
                    count={ramCount} label="RAM" icon={MemoryStick} loading={loading}
                    accentClass="border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400"
                />
                <StatCard
                    count={diskCount} label="Disco" icon={HardDrive} loading={loading}
                    accentClass="border-orange-200 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-400"
                />
                <StatCard
                    count={tempCount} label="Temperatura" icon={Thermometer} loading={loading}
                    accentClass="border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-400"
                />
            </div>

            {/* Equipments table */}
            <div className="rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#1F1F23] bg-gray-50/50 dark:bg-[#1F1F23]/50">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Equipos con alertas activas
                        </span>
                    </div>
                    {!loading && (
                        <Badge variant="secondary" className="font-bold">{equipments.length}</Badge>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-2 p-4">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                ) : equipments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <Activity className="h-10 w-10 mb-2 opacity-30" />
                        <p className="text-sm">Todos los equipos operan dentro de los parámetros normales.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-gray-50/50 dark:bg-[#1F1F23]/50">
                            <TableRow>
                                <TableHead>Equipo</TableHead>
                                <TableHead>Ubicación</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Alertas activas</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {equipments.map((eq) => {
                                const alertCount = [eq.hasCpuAlert, eq.hasRamAlert, eq.hasDiskAlert, eq.hasThermalAlert].filter(Boolean).length;
                                return (
                                    <TableRow key={eq.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1F1F23]/30">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-[#1F1F23] flex items-center justify-center relative">
                                                    <Monitor className="h-4 w-4 text-gray-500" />
                                                    {alertCount > 0 && (
                                                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                                                            {alertCount}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{eq.name}</p>
                                                    <p className="text-xs text-gray-400 font-mono">{eq.code}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <MapPin className="h-3 w-3" />
                                                {eq.ubication || <span className="italic text-gray-400">Sin ubicación</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {eq.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <AlertBadges eq={eq} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2 text-xs"
                                                    onClick={() => navigate(`/main/equipos`)}
                                                >
                                                    <Eye className="mr-1 h-3 w-3" />
                                                    Snapshot
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2 text-xs"
                                                    onClick={() => navigate(`/main/performance/historial/${eq.id}`)}
                                                >
                                                    <History className="mr-1 h-3 w-3" />
                                                    Historial
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
