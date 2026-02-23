import { useParams, useNavigate } from 'react-router-dom';
import { useSoftwareHistory } from '../hooks/useSoftware';
import { useEquipmentById } from '@/features/equipos/hooks/useEquipment';
import { SoftwareItemsTable } from '../components/snapshot/SoftwareItemsTable';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ArrowLeft,
    CalendarClock,
    History,
    Package,
    ShieldAlert,
    ShieldOff,
} from 'lucide-react';

export default function SoftwareHistoryPage() {
    const { equipmentId } = useParams<{ equipmentId: string }>();
    const navigate = useNavigate();

    const id = Number(equipmentId);
    const { equipment } = useEquipmentById(id);
    const { history, loading } = useSoftwareHistory(id);

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
                            Historial de Snapshots
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

                    {!loading && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <CalendarClock className="h-4 w-4" />
                            {history.length} snapshot{history.length !== 1 ? 's' : ''} registrado{history.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            </div>

            {/* Loading skeleton */}
            {loading && (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && history.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
                    <History className="h-12 w-12 opacity-30" />
                    <p className="text-sm">No hay snapshots registrados para este equipo</p>
                </div>
            )}

            {/* Accordion of snapshots */}
            {!loading && history.length > 0 && (
                <Accordion type="multiple" className="flex flex-col gap-2">
                    {history.map((snapshot, index) => (
                        <AccordionItem
                            key={snapshot.capturedAt}
                            value={snapshot.capturedAt}
                            className="rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] overflow-hidden px-0"
                        >
                            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-gray-50/50 dark:hover:bg-[#1F1F23]/30 [&>svg]:text-gray-400">
                                <div className="flex flex-col md:flex-row md:items-center gap-3 w-full text-left">
                                    {/* Date + "latest" badge */}
                                    <div className="flex items-center gap-2 min-w-0">
                                        <CalendarClock className="h-4 w-4 text-gray-400 shrink-0" />
                                        <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                            {new Date(snapshot.capturedAt).toLocaleString()}
                                        </span>
                                        {index === 0 && (
                                            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">
                                                Más reciente
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Stats chips */}
                                    <div className="flex items-center gap-2 md:ml-auto mr-3">
                                        <Badge variant="outline" className="flex items-center gap-1 text-xs font-normal border-gray-200 dark:border-gray-700">
                                            <Package className="h-3 w-3" />
                                            {snapshot.totalItems} programas
                                        </Badge>
                                        {snapshot.riskyCount > 0 && (
                                            <Badge variant="outline" className="flex items-center gap-1 text-xs font-normal bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                                                <ShieldAlert className="h-3 w-3" />
                                                {snapshot.riskyCount} riesgo{snapshot.riskyCount !== 1 ? 's' : ''}
                                            </Badge>
                                        )}
                                        {snapshot.unlicensedCount > 0 && (
                                            <Badge variant="outline" className="flex items-center gap-1 text-xs font-normal bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                                                <ShieldOff className="h-3 w-3" />
                                                {snapshot.unlicensedCount} sin licencia
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </AccordionTrigger>

                            <AccordionContent className="px-0 pb-0">
                                <div className="border-t border-gray-100 dark:border-[#1F1F23]">
                                    <SoftwareItemsTable items={snapshot.items} />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </div>
    );
}
