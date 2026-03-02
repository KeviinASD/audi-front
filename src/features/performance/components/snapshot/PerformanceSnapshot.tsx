import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Cpu,
    MemoryStick,
    HardDrive,
    Wifi,
    Clock,
    AlertTriangle,
    Thermometer,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
} from 'lucide-react';
import type { ProcessInfo, PerformanceSnapshotResponse } from '../../interfaces';

// ── Helpers ───────────────────────────────────────────────────────────────────

// TypeORM decimal columns come back as strings from JSON — always coerce first
function toNum(val?: number | string | null): number | null {
    if (val == null) return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
}

function usageColor(raw?: number | string | null): string {
    const pct = toNum(raw);
    if (pct == null) return 'bg-gray-300';
    if (pct >= 90) return 'bg-red-500';
    if (pct >= 70) return 'bg-amber-400';
    return 'bg-emerald-500';
}

function tempColor(raw?: number | string | null): string {
    const c = toNum(raw);
    if (c == null) return 'text-gray-400';
    if (c >= 85) return 'text-red-500';
    if (c >= 70) return 'text-amber-500';
    return 'text-emerald-600';
}

function formatUptime(raw?: number | string | null): string {
    const seconds = toNum(raw);
    if (seconds == null) return 'N/A';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const parts: string[] = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    parts.push(`${m}min`);
    return parts.join(' ');
}

function fmt(val?: number | string | null, decimals = 1): string {
    const n = toNum(val);
    return n != null ? n.toFixed(decimals) : 'N/A';
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children, alert = false }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    alert?: boolean;
}) {
    return (
        <div className="rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] overflow-hidden">
            <div className={`flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-[#1F1F23] ${alert ? 'bg-red-50 dark:bg-red-900/10' : 'bg-gray-50/50 dark:bg-[#1F1F23]/50'}`}>
                <Icon className={`h-4 w-4 ${alert ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`} />
                <span className={`text-sm font-semibold ${alert ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>{title}</span>
            </div>
            <div className="px-4 py-3">{children}</div>
        </div>
    );
}

function UsageBar({ label, pct, detail }: { label: string; pct?: number; detail?: string }) {
    const color = usageColor(pct);
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>{label}</span>
                <span className="font-medium">{pct != null ? `${fmt(pct)}%` : 'N/A'}{detail ? ` · ${detail}` : ''}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${color}`}
                    style={{ width: `${Math.min(pct ?? 0, 100)}%` }}
                />
            </div>
        </div>
    );
}

function StatRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between py-1 border-b border-gray-50 dark:border-gray-800/50 last:border-0 text-sm">
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{value}</span>
        </div>
    );
}

function ProcessTable({ processes, label }: { processes?: ProcessInfo[]; label: string }) {
    if (!processes || processes.length === 0) {
        return <p className="text-xs text-gray-400 italic py-1">Sin datos de procesos.</p>;
    }
    return (
        <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</p>
            <table className="w-full text-xs">
                <thead>
                    <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-800">
                        <th className="text-left py-1 font-medium">Proceso</th>
                        <th className="text-right py-1 font-medium">PID</th>
                        <th className="text-right py-1 font-medium">CPU %</th>
                        <th className="text-right py-1 font-medium">RAM MB</th>
                        <th className="text-right py-1 font-medium">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {processes.map((p) => (
                        <tr key={p.pid} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                            <td className="py-1 font-mono text-gray-800 dark:text-gray-200 truncate max-w-[130px]">{p.name}</td>
                            <td className="py-1 text-right text-gray-400">{p.pid}</td>
                            <td className={`py-1 text-right font-medium ${Number(p.cpuPercent) >= 50 ? 'text-red-500' : Number(p.cpuPercent) >= 20 ? 'text-amber-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                {fmt(p.cpuPercent)}%
                            </td>
                            <td className="py-1 text-right text-gray-600 dark:text-gray-400">{fmt(p.ramMB, 0)}</td>
                            <td className="py-1 text-right">
                                <Badge variant="outline" className="text-[10px] px-1 py-0 capitalize">{p.status}</Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ── Alert chips ───────────────────────────────────────────────────────────────

function AlertChips({ snap }: { snap: PerformanceSnapshotResponse }) {
    const alerts = [
        { flag: snap.hasCpuAlert, label: 'CPU' },
        { flag: snap.hasRamAlert, label: 'RAM' },
        { flag: snap.hasDiskAlert, label: 'Disco' },
        { flag: snap.hasThermalAlert, label: 'Temperatura' },
    ].filter(a => a.flag);

    if (alerts.length === 0) return null;

    return (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex-wrap">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            <span className="text-sm font-medium text-red-700 dark:text-red-400">Alertas activas:</span>
            {alerts.map(a => (
                <Badge key={a.label} variant="outline" className="text-red-600 border-red-300 dark:border-red-700 text-xs">
                    {a.label}
                </Badge>
            ))}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

interface PerformanceSnapshotProps {
    snapshot: PerformanceSnapshotResponse;
}

export function PerformanceSnapshot({ snapshot: s }: PerformanceSnapshotProps) {
    const ramDetail = s.ramTotalGB != null && s.ramUsedGB != null
        ? `${fmt(s.ramUsedGB)} / ${fmt(s.ramTotalGB)} GB`
        : undefined;
    const diskDetail = s.diskTotalGB != null && s.diskUsedGB != null
        ? `${fmt(s.diskUsedGB, 0)} / ${fmt(s.diskTotalGB, 0)} GB`
        : undefined;

    return (
        <div className="flex flex-col gap-4 py-3">
            <AlertChips snap={s} />

            <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                    Capturado: {new Date(s.capturedAt).toLocaleString()}
                </p>
                <Badge variant="secondary" className="text-xs capitalize">{s.mode}</Badge>
            </div>

            {/* CPU */}
            <Section title="CPU" icon={Cpu} alert={s.hasCpuAlert}>
                <div className="space-y-3">
                    <UsageBar label="Uso de CPU" pct={s.cpuUsagePercent} />
                    {s.cpuTemperatureC != null && (
                        <div className="flex items-center gap-1.5 text-sm pt-1">
                            <Thermometer className={`h-4 w-4 ${tempColor(s.cpuTemperatureC)}`} />
                            <span className="text-gray-500">Temperatura:</span>
                            <span className={`font-medium ${tempColor(s.cpuTemperatureC)}`}>
                                {fmt(s.cpuTemperatureC)}°C
                            </span>
                        </div>
                    )}
                </div>
            </Section>

            {/* RAM */}
            <Section title="Memoria RAM" icon={MemoryStick} alert={s.hasRamAlert}>
                <div className="space-y-3">
                    <UsageBar label="Uso de RAM" pct={s.ramUsagePercent} detail={ramDetail} />
                </div>
            </Section>

            {/* Disk */}
            <Section title="Disco" icon={HardDrive} alert={s.hasDiskAlert || s.hasThermalAlert}>
                <div className="space-y-3">
                    <UsageBar label="Uso de disco" pct={s.diskUsagePercent} detail={diskDetail} />
                    <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="flex items-center gap-1.5 text-sm">
                            <ArrowUpRight className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-500">Escritura:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {s.diskWriteSpeedMBs != null ? `${fmt(s.diskWriteSpeedMBs)} MB/s` : 'N/A'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                            <ArrowDownRight className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-500">Lectura:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {s.diskReadSpeedMBs != null ? `${fmt(s.diskReadSpeedMBs)} MB/s` : 'N/A'}
                            </span>
                        </div>
                    </div>
                    {s.diskTemperatureC != null && (
                        <div className="flex items-center gap-1.5 text-sm">
                            <Thermometer className={`h-4 w-4 ${tempColor(s.diskTemperatureC)}`} />
                            <span className="text-gray-500">Temperatura disco:</span>
                            <span className={`font-medium ${tempColor(s.diskTemperatureC)}`}>
                                {fmt(s.diskTemperatureC)}°C
                            </span>
                        </div>
                    )}
                </div>
            </Section>

            {/* Network */}
            <Section title="Red" icon={Wifi}>
                <div className="space-y-1">
                    {s.networkAdapterName && (
                        <StatRow label="Adaptador" value={s.networkAdapterName} />
                    )}
                    <StatRow
                        label="Enviado"
                        value={s.networkSentMBs != null ? `${fmt(s.networkSentMBs)} MB/s` : 'N/A'}
                    />
                    <StatRow
                        label="Recibido"
                        value={s.networkReceivedMBs != null ? `${fmt(s.networkReceivedMBs)} MB/s` : 'N/A'}
                    />
                </div>
            </Section>

            {/* Uptime */}
            <Section title="Uptime y sistema" icon={Clock}>
                <div className="space-y-1">
                    <StatRow label="Tiempo activo" value={formatUptime(s.uptimeSeconds)} />
                    <StatRow
                        label="Último arranque"
                        value={s.lastBootTime
                            ? new Date(s.lastBootTime).toLocaleString()
                            : 'N/A'}
                    />
                </div>
            </Section>

            {/* Top processes */}
            {(s.topProcessesByCpu?.length || s.topProcessesByRam?.length) ? (
                <Section title="Procesos principales" icon={Activity}>
                    <div className="space-y-4">
                        <ProcessTable processes={s.topProcessesByCpu} label="Por CPU" />
                        {s.topProcessesByCpu?.length && s.topProcessesByRam?.length
                            ? <hr className="border-gray-100 dark:border-gray-800" />
                            : null}
                        <ProcessTable processes={s.topProcessesByRam} label="Por RAM" />
                    </div>
                </Section>
            ) : null}
        </div>
    );
}

export function PerformanceSnapshotSkeleton() {
    return (
        <div className="flex flex-col gap-4 py-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden">
                    <Skeleton className="h-9 w-full" />
                    <div className="px-4 py-3 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-2 w-full rounded-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            ))}
        </div>
    );
}
