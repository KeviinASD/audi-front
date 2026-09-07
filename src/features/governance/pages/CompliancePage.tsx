import { useState } from 'react';
import {
    ShieldCheck, AlertTriangle, HelpCircle, Monitor, TrendingDown, Info,
    ServerCrash, RefreshCw, CalendarClock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParkCompliance } from '../hooks/useCompliance';
import { EvaluationRow } from '../components/compliance/EvaluationRow';
import { SEVERITY_STYLES } from '../lib/threshold-display';
import type { ThresholdSeverity } from '../interfaces';

const SEVERITY_ORDER: ThresholdSeverity[] = ['critical', 'high', 'medium', 'low'];

export default function CompliancePage() {
    const { data, loading, error, refetch } = useParkCompliance();
    const [selectedEquipment, setSelectedEquipment] = useState<number | null>(null);

    if (loading && !data) {
        return (
            <div className="flex flex-col gap-6 p-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    // Nunca dejar la pantalla en blanco: si falló, hay que poder verlo y reintentar.
    if (error && !data) {
        return (
            <div className="p-6">
                <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 p-6 flex flex-col items-start gap-3 max-w-2xl">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                        <ServerCrash className="h-5 w-5" />
                        <h2 className="font-semibold">No se pudo evaluar el cumplimiento</h2>
                    </div>
                    <p className="text-sm text-red-800/90 dark:text-red-300/80">{error}</p>
                    <Button variant="outline" size="sm" onClick={refetch}>
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                        Reintentar
                    </Button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { summary, byThreshold, equipments } = data;
    const activeEquipment =
        equipments.find(e => e.equipment.id === selectedEquipment) ?? equipments[0] ?? null;

    return (
        <div className="flex flex-col gap-6 p-6 min-w-0 max-w-full animate-in fade-in duration-500">

            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                    Cumplimiento
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-3xl">
                    Acá se cruzan los dos mundos: el dato que el agente recolectó de cada equipo
                    contra el umbral que se declaró como aceptable. Es el resultado de aplicar
                    la política a la realidad.
                </p>
            </div>

            {/* ── Resumen del parque ───────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-gray-50/60 dark:bg-[#1F1F23]/40">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <Monitor className="h-3.5 w-3.5" />
                        Equipos evaluados
                    </div>
                    <div className="text-2xl font-bold mt-1">{summary.equipmentCount}</div>
                </div>
                <div className="p-4 rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-emerald-50/50 dark:bg-emerald-900/10">
                    <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Controles que cumplen
                    </div>
                    <div className="text-2xl font-bold mt-1">{summary.compliant}</div>
                </div>
                <div className="p-4 rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-red-50/50 dark:bg-red-900/10">
                    <div className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Incumplimientos
                    </div>
                    <div className="text-2xl font-bold mt-1">{summary.breached}</div>
                </div>
                <div className="p-4 rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-violet-50/50 dark:bg-violet-900/10">
                    <div className="text-sm font-medium text-violet-600 dark:text-violet-400">
                        Tasa de cumplimiento
                    </div>
                    <div className="text-2xl font-bold mt-1">{summary.complianceRate}%</div>
                    <Progress value={summary.complianceRate} className="mt-2 h-1.5" />
                </div>
            </div>

            {/* ── Evidencia vencida ────────────────────────────────── */}
            {summary.staleEquipments > 0 && (
                <div className="flex gap-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10 p-4">
                    <CalendarClock className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-900 dark:text-amber-300">
                        <p className="font-medium">
                            {summary.staleEquipments} de {summary.equipmentCount} equipos
                            se evalúan con evidencia de más de 7 días.
                        </p>
                        <p className="mt-1 text-amber-800/90 dark:text-amber-300/80">
                            La evaluación usa <strong>el último snapshot que reportó cada equipo,
                            sin importar de cuándo sea</strong>. Si un equipo dejó de sincronizar,
                            su veredicto describe el pasado, no el estado actual. Cada resultado
                            lleva la fecha de su evidencia.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Equipos que no se pudieron evaluar ───────────────── */}
            {summary.skipped > 0 && (
                <div className="flex gap-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 p-4">
                    <ServerCrash className="h-5 w-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-900 dark:text-red-300">
                        <strong>{summary.skipped} equipo{summary.skipped === 1 ? '' : 's'}</strong> falló
                        al evaluarse y quedó fuera del reporte. El detalle está en el log del backend.
                    </p>
                </div>
            )}

            {/* ── Nota sobre los puntos ciegos ─────────────────────── */}
            {summary.noData > 0 && (
                <div className="flex gap-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10 p-4">
                    <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-900 dark:text-amber-300">
                        <p className="font-medium">
                            {summary.noData} control{summary.noData === 1 ? '' : 'es'} sin datos.
                        </p>
                        <p className="mt-1 text-amber-800/90 dark:text-amber-300/80">
                            Un dato que el agente no reportó <strong>no cuenta como cumplido</strong>:
                            es un punto ciego. Por eso la tasa se calcula sólo sobre lo evaluable —
                            contar los ausentes como buenos inflaría el resultado.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Incumplimientos por severidad ────────────────────── */}
            <div className="rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] p-4">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                    Incumplimientos por severidad
                </div>
                <div className="flex flex-wrap gap-4">
                    {SEVERITY_ORDER.map((severity) => (
                        <div key={severity} className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${SEVERITY_STYLES[severity].dot}`} />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {SEVERITY_STYLES[severity].label}
                            </span>
                            <span className="font-bold text-gray-900 dark:text-gray-100">
                                {summary.breachesBySeverity[severity] ?? 0}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <Tabs defaultValue="by-threshold" className="w-full min-w-0">
                <TabsList>
                    <TabsTrigger value="by-threshold" className="text-xs">
                        Dónde actuar primero
                    </TabsTrigger>
                    <TabsTrigger value="by-equipment" className="text-xs">
                        Detalle por equipo
                    </TabsTrigger>
                </TabsList>

                {/* ── Ranking de umbrales más incumplidos ──────────── */}
                <TabsContent value="by-threshold" className="mt-4">
                    <div className="flex gap-3 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 p-4 mb-4">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-900 dark:text-blue-300">
                            Ordenado por cantidad de equipos que incumplen. Un control que falla
                            en muchos equipos casi nunca es un descuido individual: es un problema
                            de proceso.
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] divide-y divide-gray-200 dark:divide-[#1F1F23] overflow-hidden">
                        {byThreshold.map((stat) => (
                            <div key={stat.thresholdId} className="p-4 flex flex-wrap items-center gap-3">
                                <span className={`h-2 w-2 rounded-full shrink-0 ${SEVERITY_STYLES[stat.severityOnBreach].dot}`} />
                                <div className="min-w-0 flex-1">
                                    <div className="font-mono text-[10px] text-gray-400">{stat.code}</div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {stat.label}
                                    </div>
                                </div>
                                <Badge
                                    variant="outline"
                                    className="font-mono text-[10px] bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800"
                                >
                                    {stat.cobitObjective}
                                </Badge>
                                <div className="w-40 shrink-0">
                                    <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                                        <span>{stat.complianceRate}% cumple</span>
                                        {stat.breached > 0 && (
                                            <span className="text-red-600 dark:text-red-400 flex items-center gap-0.5">
                                                <TrendingDown className="h-3 w-3" />
                                                {stat.breached}
                                            </span>
                                        )}
                                    </div>
                                    <Progress value={stat.complianceRate} className="h-1.5" />
                                </div>
                            </div>
                        ))}
                        {byThreshold.length === 0 && (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                Todavía no hay equipos con datos para evaluar.
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* ── Detalle por equipo ───────────────────────────── */}
                <TabsContent value="by-equipment" className="mt-4">
                    <div className="flex flex-col lg:flex-row gap-4 min-w-0">

                        <div className="lg:w-64 shrink-0 rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] overflow-hidden">
                            <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-200 dark:border-[#1F1F23]">
                                Equipos
                            </div>
                            <div className="max-h-[520px] overflow-y-auto divide-y divide-gray-200 dark:divide-[#1F1F23]">
                                {equipments.map((item) => {
                                    const isActive = activeEquipment?.equipment.id === item.equipment.id;
                                    return (
                                        <button
                                            key={item.equipment.id}
                                            onClick={() => setSelectedEquipment(item.equipment.id)}
                                            className={`w-full text-left px-3 py-2.5 transition-colors ${
                                                isActive
                                                    ? 'bg-primary/10'
                                                    : 'hover:bg-gray-50 dark:hover:bg-[#1F1F23]/40'
                                            }`}
                                        >
                                            <div className="font-mono text-[11px] text-gray-500">
                                                {item.equipment.code}
                                            </div>
                                            <div className="flex items-center justify-between gap-2 mt-0.5">
                                                <span className="text-sm truncate text-gray-900 dark:text-gray-100">
                                                    {item.equipment.name}
                                                </span>
                                                <span
                                                    className={`text-xs font-bold shrink-0 ${
                                                        item.summary.breached > 0
                                                            ? 'text-red-600 dark:text-red-400'
                                                            : 'text-emerald-600 dark:text-emerald-400'
                                                    }`}
                                                >
                                                    {item.summary.complianceRate}%
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                                {equipments.length === 0 && (
                                    <div className="p-4 text-center text-xs text-gray-500">
                                        No hay equipos activos
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-3">
                            {activeEquipment ? (
                                <>
                                    <div className="rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] p-4 flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <div className="font-mono text-[11px] text-gray-500">
                                                {activeEquipment.equipment.code}
                                            </div>
                                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                {activeEquipment.equipment.name}
                                            </div>
                                        </div>
                                        <div className="flex gap-4 text-sm">
                                            <SmallStat label="Cumple" value={activeEquipment.summary.compliant} tone="text-emerald-600 dark:text-emerald-400" />
                                            <SmallStat label="Incumple" value={activeEquipment.summary.breached} tone="text-red-600 dark:text-red-400" />
                                            <SmallStat label="Sin datos" value={activeEquipment.summary.noData} tone="text-gray-500" />
                                        </div>
                                    </div>

                                    {/* Frescura: contra qué capturas se está evaluando */}
                                    <div
                                        className={`rounded-xl border p-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs ${
                                            activeEquipment.freshness.isStale
                                                ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10'
                                                : 'border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a]'
                                        }`}
                                    >
                                        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-500">
                                            <CalendarClock className="h-3 w-3" />
                                            Evidencia usada
                                        </span>
                                        <FreshnessItem label="Seguridad"   date={activeEquipment.freshness.security} />
                                        <FreshnessItem label="Hardware"    date={activeEquipment.freshness.hardware} />
                                        <FreshnessItem label="Rendimiento" date={activeEquipment.freshness.performance} />
                                        <FreshnessItem label="Software"    date={activeEquipment.freshness.software} />
                                        {activeEquipment.freshness.isStale && (
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] font-normal bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                                            >
                                                Vencida — {activeEquipment.freshness.ageDays} días
                                            </Badge>
                                        )}
                                    </div>

                                    {activeEquipment.evaluations.map((evaluation) => (
                                        <EvaluationRow key={evaluation.thresholdId} evaluation={evaluation} />
                                    ))}
                                </>
                            ) : (
                                <div className="rounded-xl border border-gray-200 dark:border-[#1F1F23] p-8 text-center text-sm text-gray-500">
                                    Seleccioná un equipo para ver el detalle.
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

const FreshnessItem = ({ label, date }: { label: string; date: string | null }) => (
    <span className="flex items-center gap-1.5">
        <span className="text-gray-500 dark:text-gray-400">{label}:</span>
        <span className={date ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 italic'}>
            {date ? new Date(date).toLocaleDateString() : 'sin captura'}
        </span>
    </span>
);

const SmallStat = ({ label, value, tone }: { label: string; value: number; tone: string }) => (
    <div className="text-center">
        <div className={`text-lg font-bold ${tone}`}>{value}</div>
        <div className="text-[10px] uppercase tracking-wider text-gray-400">{label}</div>
    </div>
);
