import { Badge } from '@/components/ui/badge';
import {
    Cpu,
    MemoryStick,
    HardDrive,
    Shield,
    ShieldAlert,
    ShieldOff,
    ShieldCheck,
    Activity,
    PackageX,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock,
    CalendarClock,
    TrendingUp,
    TrendingDown,
    Minus,
    HelpCircle,
    MapPin,
    RefreshCw,
} from 'lucide-react';
import { statusConfig } from '../heatmap/HeatMap';
import type { EquipmentDailyDetail, StatusComparison } from '../../interfaces';
import type { HardwareSnapshotResponse } from '@/features/hardware/interfaces';
import type { SecuritySnapshotResponse } from '@/features/security/interfaces';
import type { PerformanceSnapshotResponse } from '@/features/performance/interfaces';

// ── Helpers ───────────────────────────────────────────────────────────────────

function toNum(v?: unknown): number | null {
    if (v == null) return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
}

function fmt(v?: unknown, d = 1): string {
    const n = toNum(v);
    return n != null ? n.toFixed(d) : '—';
}

function usageBar(pct?: unknown) {
    const n = toNum(pct) ?? 0;
    const color = n >= 90 ? 'bg-red-500' : n >= 70 ? 'bg-amber-400' : 'bg-emerald-500';
    return (
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-0.5">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(n, 100)}%` }} />
        </div>
    );
}

// ── Stale badge ───────────────────────────────────────────────────────────────

function StaleBadge({ stale, staleDays, capturedAt }: { stale: boolean; staleDays: number; capturedAt: string | null }) {
    if (!capturedAt) return <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-gray-400">Sin dato</Badge>;

    const dateStr = new Date(capturedAt).toLocaleDateString();
    if (stale) {
        return (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-300 dark:border-amber-700 flex items-center gap-1">
                <AlertTriangle className="h-2.5 w-2.5" />
                {dateStr} · {staleDays}d de retraso
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-emerald-600 border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="h-2.5 w-2.5" />
            {dateStr}
        </Badge>
    );
}

// ── Bool row ──────────────────────────────────────────────────────────────────

function BoolRow({ label, value, invertColors = false }: { label: string; value: boolean; invertColors?: boolean }) {
    const isGood = invertColors ? !value : value;
    return (
        <div className="flex items-center justify-between text-xs py-0.5">
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            {isGood
                ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                : <XCircle className="h-3.5 w-3.5 text-red-500" />}
        </div>
    );
}

function TextRow({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div className="flex items-center justify-between text-xs py-0.5">
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <span className="font-medium text-gray-800 dark:text-gray-200 text-right max-w-[55%] truncate">
                {value ?? <span className="text-gray-400 font-normal italic">—</span>}
            </span>
        </div>
    );
}

// ── Module card ───────────────────────────────────────────────────────────────

function ModuleCard({ title, icon: Icon, danger, children, capturedAt, stale, staleDays }: {
    title: string;
    icon: React.ElementType;
    danger?: boolean;
    children: React.ReactNode;
    capturedAt: string | null;
    stale: boolean;
    staleDays: number;
}) {
    return (
        <div className="rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] overflow-hidden">
            <div className={`flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-[#1F1F23]
                ${danger ? 'bg-red-50 dark:bg-red-900/10' : 'bg-gray-50/50 dark:bg-[#1F1F23]/50'}`}>
                <div className="flex items-center gap-2">
                    <Icon className={`h-3.5 w-3.5 ${danger ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span className={`text-xs font-semibold ${danger ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>{title}</span>
                </div>
                <StaleBadge stale={stale} staleDays={staleDays} capturedAt={capturedAt} />
            </div>
            <div className="px-3 py-2">{children}</div>
        </div>
    );
}

// ── Status comparison ─────────────────────────────────────────────────────────

const comparisonConfig: Record<StatusComparison, { icon: React.ElementType; label: string; className: string }> = {
    improved: { icon: TrendingUp,   label: 'Mejoró',          className: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
    same:     { icon: Minus,        label: 'Sin cambio',      className: 'text-gray-500 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700' },
    worsened: { icon: TrendingDown, label: 'Empeoró',         className: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
    unknown:  { icon: HelpCircle,   label: 'Sin comparación', className: 'text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700' },
};

// ── Hardware card content ─────────────────────────────────────────────────────

function HardwareContent({ hw }: { hw: HardwareSnapshotResponse }) {
    const ramPct = hw.ramTotalGB && hw.ramUsedGB
        ? (toNum(hw.ramUsedGB)! / toNum(hw.ramTotalGB)!) * 100
        : null;
    const diskPct = hw.diskCapacityGB && hw.diskUsedGB
        ? (toNum(hw.diskUsedGB)! / toNum(hw.diskCapacityGB)!) * 100
        : null;

    return (
        <div className="space-y-2">
            {hw.isObsolete && (
                <div className="flex items-center gap-1.5 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded px-2 py-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    Hardware con mejoras pendientes
                </div>
            )}
            <div className="grid grid-cols-2 gap-x-4">
                <div>
                    <p className="text-[10px] font-medium text-gray-400 mb-1">CPU</p>
                    <TextRow label="Modelo" value={hw.cpuModel} />
                    <TextRow label="Núcleos" value={hw.cpuCores} />
                    {hw.cpuUsagePercent != null && (
                        <div className="text-xs py-0.5">
                            <div className="flex justify-between text-gray-500">
                                <span>Uso</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">{fmt(hw.cpuUsagePercent)}%</span>
                            </div>
                            {usageBar(hw.cpuUsagePercent)}
                        </div>
                    )}
                    {hw.cpuTemperatureC != null && (
                        <TextRow label="Temp." value={`${fmt(hw.cpuTemperatureC)}°C`} />
                    )}
                </div>
                <div>
                    <p className="text-[10px] font-medium text-gray-400 mb-1">Almacenamiento</p>
                    <TextRow label="Tipo" value={hw.diskType} />
                    <TextRow label="Capacidad" value={hw.diskCapacityGB != null ? `${fmt(hw.diskCapacityGB, 0)} GB` : undefined} />
                    {diskPct != null && (
                        <div className="text-xs py-0.5">
                            <div className="flex justify-between text-gray-500">
                                <span>Uso</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">{fmt(diskPct, 0)}%</span>
                            </div>
                            {usageBar(diskPct)}
                        </div>
                    )}
                    <TextRow label="SMART" value={hw.diskSmartStatus} />
                </div>
            </div>
            <div>
                <p className="text-[10px] font-medium text-gray-400 mb-1">RAM</p>
                <div className="text-xs py-0.5">
                    <div className="flex justify-between text-gray-500">
                        <span>Uso</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                            {hw.ramUsedGB != null && hw.ramTotalGB != null
                                ? `${fmt(hw.ramUsedGB)} / ${fmt(hw.ramTotalGB)} GB`
                                : '—'}
                        </span>
                    </div>
                    {ramPct != null && usageBar(ramPct)}
                </div>
            </div>
        </div>
    );
}

// ── Security card content ─────────────────────────────────────────────────────

function SecurityContent({ sec }: { sec: SecuritySnapshotResponse }) {
    return (
        <div className="space-y-1">
            <BoolRow label="Antivirus activo"            value={sec.antivirusEnabled} />
            <BoolRow label="Firewall habilitado"         value={sec.firewallEnabled} />
            <BoolRow label="Actualización crítica"       value={sec.isCriticalUpdatePending} invertColors />
            <BoolRow label="UAC habilitado"              value={sec.uacEnabled} />
            <BoolRow label="RDP habilitado"              value={sec.rdpEnabled} invertColors />
            {sec.antivirusName && (
                <TextRow label="Antivirus" value={sec.antivirusName} />
            )}
            {sec.daysSinceLastUpdate != null && (
                <TextRow label="Días sin actualizar" value={sec.daysSinceLastUpdate} />
            )}
        </div>
    );
}

// ── Performance card content ──────────────────────────────────────────────────

function PerformanceContent({ perf }: { perf: PerformanceSnapshotResponse }) {
    const metrics = [
        { label: 'CPU', icon: Cpu, value: perf.cpuUsagePercent, alert: perf.hasCpuAlert },
        { label: 'RAM', icon: MemoryStick, value: perf.ramUsagePercent, alert: perf.hasRamAlert },
        { label: 'Disco', icon: HardDrive, value: perf.diskUsagePercent, alert: perf.hasDiskAlert },
    ];

    return (
        <div className="space-y-2">
            {metrics.map(({ label, icon: Icon, value, alert }) => (
                <div key={label} className="text-xs">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-0.5">
                        <div className="flex items-center gap-1.5">
                            <Icon className="h-3 w-3" />
                            {label}
                            {alert && <AlertTriangle className="h-2.5 w-2.5 text-red-500" />}
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                            {value != null ? `${fmt(value)}%` : '—'}
                        </span>
                    </div>
                    {usageBar(value)}
                </div>
            ))}
            {perf.hasThermalAlert && (
                <div className="flex items-center gap-1.5 text-[10px] text-red-600 dark:text-red-400 mt-1">
                    <AlertTriangle className="h-3 w-3" />
                    Alerta térmica activa
                </div>
            )}
            {perf.uptimeSeconds != null && (
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800 mt-1">
                    <Clock className="h-3 w-3" />
                    Uptime: {(() => {
                        const s = Number(perf.uptimeSeconds);
                        const d = Math.floor(s / 86400);
                        const h = Math.floor((s % 86400) / 3600);
                        return d > 0 ? `${d}d ${h}h` : `${h}h`;
                    })()}
                </div>
            )}
        </div>
    );
}

// ── Software card content ─────────────────────────────────────────────────────

function SoftwareContent({ riskyCount, totalCount }: { riskyCount: number; totalCount: number }) {
    const clean = totalCount - riskyCount;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Total instalado</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{totalCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1">
                    <PackageX className="h-3 w-3 text-red-500" />
                    Con riesgo
                </span>
                <span className={`font-semibold ${riskyCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {riskyCount}
                </span>
            </div>
            <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    Sin riesgo
                </span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">{clean}</span>
            </div>
            {totalCount > 0 && (
                <div className="mt-2">
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                        <div
                            className="h-full bg-red-400 transition-all"
                            style={{ width: `${(riskyCount / totalCount) * 100}%` }}
                        />
                        <div
                            className="h-full bg-emerald-400 transition-all"
                            style={{ width: `${(clean / totalCount) * 100}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 text-right">
                        {riskyCount > 0
                            ? `${((riskyCount / totalCount) * 100).toFixed(0)}% de aplicaciones con riesgo`
                            : 'Sin aplicaciones de riesgo detectadas'}
                    </p>
                </div>
            )}
        </div>
    );
}

// ── Main panel ────────────────────────────────────────────────────────────────

interface EquipmentDetailPanelProps {
    detail: EquipmentDailyDetail;
}

export function EquipmentDetailPanel({ detail }: EquipmentDetailPanelProps) {
    const cfg = statusConfig[detail.status] ?? statusConfig['no-data'];
    const StatusIcon = cfg.icon;
    const cmp = comparisonConfig[detail.statusCompareToPrevDay] ?? comparisonConfig['unknown'];
    const CmpIcon = cmp.icon;

    const hw = detail.hardware?.data as HardwareSnapshotResponse | null;
    const sec = detail.security?.data as SecuritySnapshotResponse | null;
    const perf = detail.performance?.data as PerformanceSnapshotResponse | null;

    return (
        <div className="flex flex-col gap-4">
            {/* PC header — full width */}
            <div className={`rounded-xl border p-4 ${cfg.border} ${cfg.bg.split(' ')[0]}`}>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                            {detail.equipment.name}
                        </h3>
                        <p className="text-xs font-mono text-gray-500 mt-0.5">{detail.equipment.code}</p>
                        {detail.equipment.location && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                <MapPin className="h-3 w-3" />
                                {detail.equipment.location}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.text} border ${cfg.border}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {cfg.label}
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border ${cmp.className}`}>
                            <CmpIcon className="h-3 w-3" />
                            {cmp.label} vs ayer
                        </div>
                    </div>
                </div>

                {/* Quick flags */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {detail.security?.hasRisk && (
                        <Badge variant="outline" className="text-[11px] px-2 py-0 text-red-600 border-red-300 dark:border-red-700 flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3" /> Riesgo de seguridad
                        </Badge>
                    )}
                    {((detail.software as any)?.riskyCount ?? 0) > 0 && (
                        <Badge variant="outline" className="text-[11px] px-2 py-0 text-orange-600 border-orange-300 dark:border-orange-700 flex items-center gap-1">
                            <PackageX className="h-3 w-3" /> {(detail.software as any).riskyCount} app{(detail.software as any).riskyCount !== 1 ? 's' : ''} con riesgo
                        </Badge>
                    )}
                    {hw?.isObsolete && (
                        <Badge variant="outline" className="text-[11px] px-2 py-0 text-amber-600 border-amber-300 dark:border-amber-700 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Hardware por mejorar
                        </Badge>
                    )}
                    {sec?.isCriticalUpdatePending && (
                        <Badge variant="outline" className="text-[11px] px-2 py-0 text-blue-600 border-blue-300 dark:border-blue-700 flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" /> Actualización crítica pendiente
                        </Badge>
                    )}
                </div>
            </div>

            {/* Module cards — 2-col grid on md+ */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Hardware */}
                <ModuleCard
                    title="Hardware"
                    icon={Cpu}
                    capturedAt={detail.hardware?.capturedAt ?? null}
                    stale={detail.hardware?.stale ?? false}
                    staleDays={detail.hardware?.staleDays ?? 0}
                    danger={hw?.diskSmartStatus === 'failed' || (hw?.cpuTemperatureC != null && Number(hw.cpuTemperatureC) > 85)}
                >
                    {hw ? <HardwareContent hw={hw} /> : (
                        <p className="text-xs text-gray-400 italic py-1">Sin datos de hardware.</p>
                    )}
                </ModuleCard>

                {/* Software */}
                <ModuleCard
                    title="Software"
                    icon={PackageX}
                    capturedAt={detail.software?.capturedAt ?? null}
                    stale={detail.software?.stale ?? false}
                    staleDays={detail.software?.staleDays ?? 0}
                    danger={((detail.software as any)?.riskyCount ?? 0) > 0}
                >
                    {detail.software?.data != null ? (
                        <SoftwareContent
                            riskyCount={(detail.software as any).riskyCount ?? 0}
                            totalCount={(detail.software as any).totalCount ?? 0}
                        />
                    ) : (
                        <p className="text-xs text-gray-400 italic py-1">Sin datos de software.</p>
                    )}
                </ModuleCard>

                {/* Security */}
                <ModuleCard
                    title="Seguridad"
                    icon={detail.security?.hasRisk ? ShieldAlert : ShieldCheck}
                    capturedAt={detail.security?.capturedAt ?? null}
                    stale={detail.security?.stale ?? false}
                    staleDays={detail.security?.staleDays ?? 0}
                    danger={detail.security?.hasRisk ?? false}
                >
                    {sec ? <SecurityContent sec={sec} /> : (
                        <p className="text-xs text-gray-400 italic py-1">Sin datos de seguridad.</p>
                    )}
                </ModuleCard>

                {/* Performance */}
                <ModuleCard
                    title="Rendimiento"
                    icon={Activity}
                    capturedAt={detail.performance?.capturedAt ?? null}
                    stale={detail.performance?.stale ?? false}
                    staleDays={detail.performance?.staleDays ?? 0}
                    danger={perf ? (perf.hasCpuAlert || perf.hasRamAlert || perf.hasDiskAlert || perf.hasThermalAlert) : false}
                >
                    {perf ? <PerformanceContent perf={perf} /> : (
                        <p className="text-xs text-gray-400 italic py-1">Sin datos de rendimiento.</p>
                    )}
                </ModuleCard>
            </div>
        </div>
    );
}
