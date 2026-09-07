import { useState, type ReactNode } from 'react';
import { SlidersHorizontal, CheckCircle2, Clock, Layers, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGovernanceThresholds } from '../hooks/useGovernanceThresholds';
import { ThresholdCard } from '../components/thresholds/ThresholdCard';
import { SeverityMatrixPanel } from '../components/thresholds/SeverityMatrixPanel';
import { ThresholdEditDialog } from '../components/thresholds/ThresholdEditDialog';
import { ThresholdApproveDialog } from '../components/thresholds/ThresholdApproveDialog';
import type { GovernanceThresholdResponse } from '../interfaces';

export default function ThresholdsPage() {
    const { data, loading, refetch } = useGovernanceThresholds();

    const [selected, setSelected] = useState<GovernanceThresholdResponse | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [approveOpen, setApproveOpen] = useState(false);

    const openEdit = (threshold: GovernanceThresholdResponse) => {
        setSelected(threshold);
        setEditOpen(true);
    };

    const openApprove = (threshold: GovernanceThresholdResponse) => {
        setSelected(threshold);
        setApproveOpen(true);
    };

    const handleSuccess = () => {
        setEditOpen(false);
        setApproveOpen(false);
        refetch();
    };

    if (loading && !data) {
        return (
            <div className="flex flex-col gap-6 p-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    const summary = data?.summary;
    const groups  = data?.groups ?? [];

    return (
        <div className="flex flex-col gap-6 p-6 min-w-0 max-w-full animate-in fade-in duration-500">

            {/* ── Encabezado ───────────────────────────────────────── */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <SlidersHorizontal className="h-8 w-8 text-primary" />
                    Umbrales de Gobierno
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-3xl">
                    Los valores que definen qué es aceptable y qué no. El agente ya mide estos
                    datos en cada equipo; acá se declara contra qué se los compara, por qué,
                    y quién asumió esa decisión.
                </p>
            </div>

            {/* ── Nota conceptual ──────────────────────────────────── */}
            <div className="flex gap-3 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 p-4">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-300">
                    <p className="font-medium">Medir no es gobernar.</p>
                    <p className="mt-1 text-blue-800/90 dark:text-blue-300/80">
                        Un dato como «104 días sin actualizar» no dice nada por sí solo hasta que
                        alguien decide cuántos días son tolerables. Esa decisión — documentada,
                        justificada y aprobada — es lo que convierte una herramienta de monitoreo
                        en un sistema de gobierno.
                    </p>
                </div>
            </div>

            {/* ── Resumen ──────────────────────────────────────────── */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                        icon={<Layers className="h-3.5 w-3.5" />}
                        label="Umbrales activos"
                        value={summary.active}
                        tone="text-gray-600 dark:text-gray-400"
                        bg="bg-gray-50/60 dark:bg-[#1F1F23]/40"
                    />
                    <StatCard
                        icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                        label="Aprobados"
                        value={summary.approved}
                        tone="text-emerald-600 dark:text-emerald-400"
                        bg="bg-emerald-50/50 dark:bg-emerald-900/10"
                    />
                    <StatCard
                        icon={<Clock className="h-3.5 w-3.5" />}
                        label="Sin aprobar"
                        value={summary.pendingApproval}
                        tone="text-amber-600 dark:text-amber-400"
                        bg="bg-amber-50/50 dark:bg-amber-900/10"
                    />
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-violet-50/50 dark:bg-violet-900/10">
                        <div className="text-sm font-medium text-violet-600 dark:text-violet-400">
                            Política formalizada
                        </div>
                        <div className="text-2xl font-bold mt-1">{summary.approvalRate}%</div>
                        <Progress value={summary.approvalRate} className="mt-2 h-1.5" />
                    </div>
                </div>
            )}

            {/* ── Objetivos COBIT cubiertos ────────────────────────── */}
            {summary && summary.cobitObjectives.length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] p-4">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        Objetivos COBIT 2019 a los que estos umbrales aportan evidencia
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {summary.cobitObjectives.map((objective) => (
                            <Badge
                                key={objective}
                                variant="outline"
                                className="font-mono text-[11px] bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800"
                            >
                                {objective}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Umbrales por categoría ───────────────────────────── */}
            <Tabs defaultValue={groups[0]?.category ?? 'none'} className="w-full min-w-0">
                <div className="w-full min-w-0 overflow-x-auto pb-1">
                    <TabsList className="w-max">
                        {groups.map((group) => (
                            <TabsTrigger key={group.category} value={group.category} className="text-xs">
                                {group.label}
                                <Badge
                                    variant="outline"
                                    className="ml-2 h-4 px-1.5 text-[10px] font-normal"
                                >
                                    {group.thresholds.length}
                                </Badge>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {groups.map((group) => (
                    <TabsContent key={group.category} value={group.category} className="mt-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {group.description}
                        </p>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {group.thresholds.map((threshold) => (
                                <ThresholdCard
                                    key={threshold.id}
                                    threshold={threshold}
                                    onEdit={openEdit}
                                    onApprove={openApprove}
                                />
                            ))}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>

            {/* ── Matriz de severidad ──────────────────────────────── */}
            <SeverityMatrixPanel />

            {/* ── Diálogos ─────────────────────────────────────────── */}
            <ThresholdEditDialog
                threshold={selected}
                open={editOpen}
                onOpenChange={setEditOpen}
                onSuccess={handleSuccess}
            />
            <ThresholdApproveDialog
                threshold={selected}
                open={approveOpen}
                onOpenChange={setApproveOpen}
                onSuccess={handleSuccess}
            />
        </div>
    );
}

// ── Subcomponente ────────────────────────────────────────────────────────────

const StatCard = ({
    icon,
    label,
    value,
    tone,
    bg,
}: {
    icon: ReactNode;
    label: string;
    value: number;
    tone: string;
    bg: string;
}) => (
    <div className={`p-4 rounded-xl border border-gray-200 dark:border-[#1F1F23] ${bg}`}>
        <div className={`text-sm font-medium flex items-center gap-1.5 ${tone}`}>
            {icon}
            {label}
        </div>
        <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
);
