import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEquipmentById } from '@/features/equipos/hooks/useEquipment';
import { useSecurityHistory } from '../hooks/useSecurity';
import { SecuritySnapshot, SecuritySnapshotSkeleton } from '../components/snapshot/SecuritySnapshot';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Shield, ShieldAlert, CalendarDays } from 'lucide-react';

const RANGE_OPTIONS = [
    { label: '7 días', days: 7 },
    { label: '30 días', days: 30 },
    { label: '90 días', days: 90 },
];

export default function SecurityHistoryPage() {
    const { equipmentId } = useParams<{ equipmentId: string }>();
    const navigate = useNavigate();
    const id = Number(equipmentId);

    const { equipment, loading: equipmentLoading } = useEquipmentById(id);

    const [rangeDays, setRangeDays] = useState(30);

    const { from, to } = useMemo(() => {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - rangeDays);
        return { from, to };
    }, [rangeDays]);

    const { history, loading } = useSecurityHistory(id, from, to);

    return (
        <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-2 -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="mr-1.5 h-4 w-4" />
                        Volver
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <Shield className="h-8 w-8 text-primary" />
                        Historial de Seguridad
                    </h1>
                    {equipmentLoading ? (
                        <Skeleton className="h-4 w-48 mt-1" />
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {equipment
                                ? `${equipment.name} — ${equipment.code}`
                                : 'Equipo no encontrado'}
                        </p>
                    )}
                </div>

                {/* Range selector */}
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    {RANGE_OPTIONS.map((opt) => (
                        <Button
                            key={opt.days}
                            variant={rangeDays === opt.days ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setRangeDays(opt.days)}
                        >
                            {opt.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full rounded-xl" />
                    ))}
                </div>
            ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Shield className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm">Sin snapshots de seguridad en el rango seleccionado.</p>
                </div>
            ) : (
                <Accordion type="multiple" className="space-y-3">
                    {history.map((snap, index) => {
                        const date = new Date(snap.capturedAt);
                        const isFirst = index === 0;

                        return (
                            <AccordionItem
                                key={snap.id}
                                value={String(snap.id)}
                                className="rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] overflow-hidden"
                            >
                                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50/50 dark:hover:bg-[#1F1F23]/30">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {snap.hasSecurityRisk
                                                ? <ShieldAlert className="h-4 w-4 text-red-500" />
                                                : <Shield className="h-4 w-4 text-emerald-500" />}
                                            {date.toLocaleString()}
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {isFirst && (
                                                <Badge className="text-[11px] px-2 py-0 bg-primary/10 text-primary border-primary/20">
                                                    Más reciente
                                                </Badge>
                                            )}
                                            {snap.hasSecurityRisk && (
                                                <Badge variant="outline" className="text-[11px] px-2 py-0 text-red-600 border-red-200 dark:border-red-800">
                                                    Con riesgos
                                                </Badge>
                                            )}
                                            {!snap.antivirusEnabled && (
                                                <Badge variant="outline" className="text-[11px] px-2 py-0 text-amber-600 border-amber-200 dark:border-amber-800">
                                                    Sin antivirus
                                                </Badge>
                                            )}
                                            {snap.isCriticalUpdatePending && (
                                                <Badge variant="outline" className="text-[11px] px-2 py-0 text-orange-600 border-orange-200 dark:border-orange-800">
                                                    Actualización crítica
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4 pt-0">
                                    <SecuritySnapshot snapshot={snap} />
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            )}
        </div>
    );
}
