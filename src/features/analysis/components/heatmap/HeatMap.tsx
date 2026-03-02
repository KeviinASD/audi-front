import { CheckCircle2, AlertCircle, XCircle, WifiOff, TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { DailyEquipmentStatus, EquipmentHeatMapItem, StatusComparison } from '../../interfaces';

// ── Status config ─────────────────────────────────────────────────────────────

export const statusConfig: Record<DailyEquipmentStatus, {
    label: string;
    bg: string;
    bgSelected: string;
    text: string;
    border: string;
    icon: React.ElementType;
    dot: string;
}> = {
    'operative': {
        label: 'Operativo',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
        bgSelected: 'bg-emerald-100 dark:bg-emerald-900/40 ring-2 ring-emerald-500',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        icon: CheckCircle2,
        dot: 'bg-emerald-500',
    },
    'degraded': {
        label: 'Degradado',
        bg: 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30',
        bgSelected: 'bg-amber-100 dark:bg-amber-900/40 ring-2 ring-amber-500',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        icon: AlertCircle,
        dot: 'bg-amber-400',
    },
    'critical': {
        label: 'Crítico',
        bg: 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30',
        bgSelected: 'bg-red-100 dark:bg-red-900/40 ring-2 ring-red-500',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        icon: XCircle,
        dot: 'bg-red-500',
    },
    'no-data': {
        label: 'Sin datos',
        bg: 'bg-gray-50 dark:bg-gray-900/20 hover:bg-gray-100 dark:hover:bg-gray-900/30',
        bgSelected: 'bg-gray-100 dark:bg-gray-900/40 ring-2 ring-gray-400',
        text: 'text-gray-500 dark:text-gray-400',
        border: 'border-gray-200 dark:border-gray-700',
        icon: WifiOff,
        dot: 'bg-gray-400',
    },
};

// ── Comparison icon ───────────────────────────────────────────────────────────

const comparisonIcon: Record<StatusComparison, { icon: React.ElementType; className: string; title: string }> = {
    improved: { icon: TrendingUp,   className: 'text-emerald-500', title: 'Mejoró respecto a ayer' },
    same:     { icon: Minus,        className: 'text-gray-400',    title: 'Sin cambio respecto a ayer' },
    worsened: { icon: TrendingDown, className: 'text-red-500',     title: 'Empeoró respecto a ayer' },
    unknown:  { icon: HelpCircle,   className: 'text-gray-300',    title: 'Sin datos del día anterior' },
};

// ── PC Cell ───────────────────────────────────────────────────────────────────

function PCCell({
    eq,
    isSelected,
    onClick,
}: {
    eq: EquipmentHeatMapItem;
    isSelected: boolean;
    onClick: () => void;
}) {
    const cfg = statusConfig[eq.status] ?? statusConfig['no-data'];
    const StatusIcon = cfg.icon;
    const cmp = comparisonIcon[eq.statusCompareToPrevDay] ?? comparisonIcon['unknown'];
    const CmpIcon = cmp.icon;

    const hasAlerts = eq.hasSecurityRisk || eq.riskyAppsCount > 0 || eq.isObsolete;

    return (
        <button
            onClick={onClick}
            className={`
                relative flex flex-col items-center justify-center gap-1 p-3 rounded-xl
                border transition-all duration-150 cursor-pointer text-center w-full
                ${isSelected ? cfg.bgSelected : cfg.bg} ${cfg.border}
            `}
            title={`${eq.equipment.code} — ${cfg.label}`}
        >
            {/* Trend icon top-right */}
            <span className={`absolute top-1.5 right-1.5 ${cmp.className}`} title={cmp.title}>
                <CmpIcon className="h-3 w-3" />
            </span>

            {/* Alert dot top-left */}
            {hasAlerts && (
                <span className="absolute top-1.5 left-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" title="Tiene alertas" />
            )}

            <StatusIcon className={`h-5 w-5 ${cfg.text}`} />
            <span className={`text-[10px] font-semibold font-mono leading-tight ${cfg.text}`}>
                {eq.equipment.code.split('-').pop()}
            </span>
        </button>
    );
}

// ── Legend ────────────────────────────────────────────────────────────────────

function Legend() {
    return (
        <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500">
            {(Object.entries(statusConfig) as [DailyEquipmentStatus, typeof statusConfig[DailyEquipmentStatus]][]).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                </div>
            ))}
            <div className="flex items-center gap-1.5 ml-auto">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Con alertas
            </div>
            <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <TrendingDown className="h-3 w-3 text-red-500" />
                <span>Tendencia vs ayer</span>
            </div>
        </div>
    );
}

// ── HeatMap ───────────────────────────────────────────────────────────────────

interface HeatMapProps {
    equipments: EquipmentHeatMapItem[];
    selectedId: string | null;
    onSelect: (eq: EquipmentHeatMapItem) => void;
    loading?: boolean;
}

export function HeatMap({ equipments, selectedId, onSelect, loading = false }: HeatMapProps) {
    if (loading) {
        return (
            <div className="space-y-3">
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                    {[...Array(20)].map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (equipments.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 text-sm text-gray-400 italic">
                No hay equipos en este laboratorio.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div
                className="grid gap-2"
                style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}
            >
                {equipments.map((eq) => (
                    <PCCell
                        key={eq.equipment.id}
                        eq={eq}
                        isSelected={selectedId === eq.equipment.id}
                        onClick={() => onSelect(eq)}
                    />
                ))}
            </div>
            <Legend />
        </div>
    );
}
