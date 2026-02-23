import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    AlertTriangle,
    CalendarClock,
    Cpu,
    HardDrive,
    Info,
    MemoryStick,
    MonitorCog,
    Thermometer,
} from 'lucide-react';
import { DiskSmartStatus } from '../../interfaces';
import type { HardwareSnapshotResponse } from '../../interfaces';

// ── Helpers ───────────────────────────────────────────────────────────────────

const smartConfig: Record<DiskSmartStatus, { label: string; className: string }> = {
    [DiskSmartStatus.GOOD]:    { label: 'Bueno',    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    [DiskSmartStatus.WARNING]: { label: 'Alerta',   className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'         },
    [DiskSmartStatus.FAILED]:  { label: 'Fallando', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'                 },
    [DiskSmartStatus.UNKNOWN]: { label: 'Unknown',  className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'                },
};

function usageColor(percent: number) {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-[#1F1F23] last:border-0">
            <span className="text-xs text-gray-500">{label}</span>
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200 text-right">{value ?? '—'}</span>
        </div>
    );
}

function Section({ icon: Icon, title, children }: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-lg border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] p-4">
            <div className="flex items-center gap-2 mb-3">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</span>
            </div>
            {children}
        </div>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface HardwareSnapshotProps {
    snapshot: HardwareSnapshotResponse;
}

export const HardwareSnapshot = ({ snapshot }: HardwareSnapshotProps) => {
    const ramUsedPercent = snapshot.ramTotalGB && snapshot.ramUsedGB
        ? Math.round((snapshot.ramUsedGB / snapshot.ramTotalGB) * 100)
        : null;

    const diskUsedPercent = snapshot.diskCapacityGB && snapshot.diskUsedGB
        ? Math.round((snapshot.diskUsedGB / snapshot.diskCapacityGB) * 100)
        : null;

    const smart = smartConfig[snapshot.diskSmartStatus] ?? smartConfig[DiskSmartStatus.UNKNOWN];

    return (
        <div className="flex flex-col gap-4 pt-2">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <CalendarClock className="h-3.5 w-3.5" />
                    Snapshot capturado el {new Date(snapshot.capturedAt).toLocaleString()}
                </div>
                {/* {snapshot.isObsolete && (
                    <div className="flex items-center gap-2 mt-1 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        Este equipo está marcado como <strong>obsoleto</strong> (antigüedad &gt;5 años, RAM &lt;4 GB o disco HDD).
                    </div>
                )} */}
            </div>

            {/* CPU */}
            <Section icon={Cpu} title="CPU">
                <Row label="Modelo"       value={snapshot.cpuModel} />
                <Row label="Núcleos"      value={snapshot.cpuCores} />
                <Row label="Frecuencia"   value={snapshot.cpuFrequencyGHz != null ? `${snapshot.cpuFrequencyGHz} GHz` : null} />
                {snapshot.cpuTemperatureC != null && (
                    <Row label="Temperatura"  value={
                        <span className="flex items-center gap-1">
                            <Thermometer className="h-3 w-3" />
                            {snapshot.cpuTemperatureC} °C
                        </span>
                    } />
                )}
                {snapshot.cpuUsagePercent != null && (
                    <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Uso actual</span>
                            <span className="font-medium">{snapshot.cpuUsagePercent}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-[#1F1F23] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${usageColor(snapshot.cpuUsagePercent)}`}
                                style={{ width: `${snapshot.cpuUsagePercent}%` }}
                            />
                        </div>
                    </div>
                )}
            </Section>

            {/* RAM */}
            <Section icon={MemoryStick} title="Memoria RAM">
                <Row label="Total"      value={snapshot.ramTotalGB != null ? `${snapshot.ramTotalGB} GB` : null} />
                <Row label="En uso"     value={snapshot.ramUsedGB  != null ? `${snapshot.ramUsedGB} GB`  : null} />
                <Row label="Tipo"       value={snapshot.ramType} />
                <Row label="Frecuencia" value={snapshot.ramFrequencyMHz != null ? `${snapshot.ramFrequencyMHz} MHz` : null} />
                {ramUsedPercent != null && (
                    <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Uso</span>
                            <span className="font-medium">{ramUsedPercent}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-[#1F1F23] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${usageColor(ramUsedPercent)}`}
                                style={{ width: `${ramUsedPercent}%` }}
                            />
                        </div>
                    </div>
                )}
            </Section>

            {/* Disk */}
            <Section icon={HardDrive} title="Almacenamiento">
                <Row label="Capacidad" value={snapshot.diskCapacityGB != null ? `${snapshot.diskCapacityGB} GB` : null} />
                <Row label="En uso"    value={snapshot.diskUsedGB     != null ? `${snapshot.diskUsedGB} GB`     : null} />
                <Row label="Tipo"      value={snapshot.diskType} />
                <Row label="Modelo"    value={snapshot.diskModel} />
                <Row label="S.M.A.R.T" value={
                    <Badge variant="outline" className={`${smart.className} border-none text-xs`}>
                        {smart.label}
                    </Badge>
                } />
                {diskUsedPercent != null && (
                    <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Uso</span>
                            <span className="font-medium">{diskUsedPercent}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-[#1F1F23] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${usageColor(diskUsedPercent)}`}
                                style={{ width: `${diskUsedPercent}%` }}
                            />
                        </div>
                    </div>
                )}
            </Section>

            {/* Physical */}
            <Section icon={MonitorCog} title="Equipo físico">
                <Row label="Marca"        value={snapshot.brand} />
                <Row label="Modelo"       value={snapshot.model} />
                <Row label="N° de serie"  value={snapshot.serialNumber} />
                <Row label="Año fab."     value={snapshot.manufactureYear} />
                <Row label="Arquitectura" value={snapshot.architecture} />
            </Section>
        </div>
    );
};

// ── Loading skeleton ──────────────────────────────────────────────────────────

export const HardwareSnapshotSkeleton = () => (
    <div className="flex flex-col gap-4 pt-2">
        <Skeleton className="h-5 w-48" />
        {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-36 w-full rounded-lg" />
        ))}
    </div>
);
