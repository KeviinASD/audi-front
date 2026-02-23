import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHardwareHistory } from '../hooks/useHardware';
import { useEquipmentById } from '@/features/equipos/hooks/useEquipment';
import { HardwareSnapshot, HardwareSnapshotSkeleton } from '../components/snapshot/HardwareSnapshot';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertTriangle,
    ArrowLeft,
    CalendarClock,
    Cpu,
    HardDrive,
    History,
    MemoryStick,
} from 'lucide-react';

// ── Date range presets ────────────────────────────────────────────────────────

const RANGES = [
    { label: '7 días',  days: 7   },
    { label: '30 días', days: 30  },
    { label: '90 días', days: 90  },
] as const;

function daysAgo(n: number) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(0, 0, 0, 0);
    return d;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HardwareHistoryPage() {
    const { equipmentId } = useParams<{ equipmentId: string }>();
    const navigate = useNavigate();

    const id = Number(equipmentId);
    const { equipment } = useEquipmentById(id);

    const [rangeDays, setRangeDays] = useState(30);
    const from = useMemo(() => daysAgo(rangeDays), [rangeDays]);
    const to   = useMemo(() => new Date(), []);

    const { history, loading } = useHardwareHistory(id, from, to);

    return (
        <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
                    onClick={() => navigate('/main/equipos')}
                >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Volver a Equipos
                </Button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
                            <History className="h-8 w-8 text-primary" />
                            Historial de Hardware
                        </h1>
                        {equipment && (
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                {equipment.name}
                                <span className="ml-2 font-mono text-xs bg-gray-100 dark:bg-[#1F1F23] text-gray-500 px-2 py-0.5 rounded">
                                    {equipment.code}
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Range selector */}
                    <div className="flex items-center gap-1.5">
                        {RANGES.map(({ label, days }) => (
                            <Button
                                key={days}
                                variant={rangeDays === days ? 'default' : 'outline'}
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => setRangeDays(days)}
                            >
                                {label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="rounded-xl border border-gray-200 dark:border-[#1F1F23] p-5">
                            <HardwareSnapshotSkeleton />
                        </div>
                    ))}
                </div>
            )}

            {/* Empty */}
            {!loading && history.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
                    <History className="h-12 w-12 opacity-30" />
                    <p className="text-sm">Sin snapshots en los últimos {rangeDays} días</p>
                </div>
            )}

            {/* Accordion */}
            {!loading && history.length > 0 && (
                <Accordion type="multiple" className="flex flex-col gap-2">
                    {history.map((snap, index) => {
                        const ramPct = snap.ramTotalGB && snap.ramUsedGB
                            ? Math.round((snap.ramUsedGB / snap.ramTotalGB) * 100)
                            : null;
                        const diskPct = snap.diskCapacityGB && snap.diskUsedGB
                            ? Math.round((snap.diskUsedGB / snap.diskCapacityGB) * 100)
                            : null;

                        return (
                            <AccordionItem
                                key={snap.id}
                                value={String(snap.id)}
                                className="rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] overflow-hidden px-0"
                            >
                                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-gray-50/50 dark:hover:bg-[#1F1F23]/30 [&>svg]:text-gray-400">
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 w-full text-left">
                                        {/* Date */}
                                        <div className="flex items-center gap-2 min-w-0">
                                            <CalendarClock className="h-4 w-4 text-gray-400 shrink-0" />
                                            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                                {new Date(snap.capturedAt).toLocaleString()}
                                            </span>
                                            {index === 0 && (
                                                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">
                                                    Más reciente
                                                </Badge>
                                            )}
                                            {/* {snap.isObsolete && (
                                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 text-xs flex items-center gap-1">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Obsoleto
                                                </Badge>
                                            )} */}
                                        </div>

                                        {/* Quick stats */}
                                        <div className="flex items-center gap-2 md:ml-auto mr-3 flex-wrap">
                                            {snap.cpuModel && (
                                                <Badge variant="outline" className="font-normal text-xs border-gray-200 dark:border-gray-700 flex items-center gap-1">
                                                    <Cpu className="h-3 w-3" />
                                                    {snap.cpuUsagePercent != null ? `CPU ${snap.cpuUsagePercent}%` : snap.cpuModel.split(' ').slice(-1)[0]}
                                                </Badge>
                                            )}
                                            {ramPct != null && (
                                                <Badge variant="outline" className="font-normal text-xs border-gray-200 dark:border-gray-700 flex items-center gap-1">
                                                    <MemoryStick className="h-3 w-3" />
                                                    RAM {ramPct}%
                                                </Badge>
                                            )}
                                            {diskPct != null && (
                                                <Badge variant="outline" className="font-normal text-xs border-gray-200 dark:border-gray-700 flex items-center gap-1">
                                                    <HardDrive className="h-3 w-3" />
                                                    Disco {diskPct}%
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="px-5 pb-5">
                                    <div className="border-t border-gray-100 dark:border-[#1F1F23] pt-4">
                                        <HardwareSnapshot snapshot={snap} />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            )}
        </div>
    );
}
