import { useNavigate } from 'react-router-dom';
import {
    useSecurityRisks,
    useEquipmentsWithoutAntivirus,
    useEquipmentsWithPendingUpdates,
} from '../hooks/useSecurity';
import type { SecurityRiskEquipmentResponse } from '../interfaces';
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
    Shield,
    ShieldAlert,
    ShieldOff,
    RefreshCw,
    Monitor,
    MapPin,
    History,
    Eye,
} from 'lucide-react';

// ── Risk table ────────────────────────────────────────────────────────────────

function RiskTable({
    equipments,
    loading,
    onViewHistory,
    onViewSnapshot,
    emptyMessage,
}: {
    equipments: SecurityRiskEquipmentResponse[];
    loading: boolean;
    onViewHistory: (id: number) => void;
    onViewSnapshot: (id: number) => void;
    emptyMessage: string;
}) {
    if (loading) {
        return (
            <div className="space-y-2 p-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
        );
    }

    if (equipments.length === 0) {
        return (
            <p className="text-sm text-gray-400 italic px-4 py-6 text-center">{emptyMessage}</p>
        );
    }

    return (
        <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-[#1F1F23]/50">
                <TableRow>
                    <TableHead>Equipo</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {equipments.map((eq) => (
                    <TableRow key={eq.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1F1F23]/30">
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-[#1F1F23] flex items-center justify-center">
                                    <Monitor className="h-4 w-4 text-gray-500" />
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
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => onViewSnapshot(eq.id)}
                                >
                                    <Eye className="mr-1 h-3 w-3" />
                                    Snapshot
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => onViewHistory(eq.id)}
                                >
                                    <History className="mr-1 h-3 w-3" />
                                    Historial
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

// ── Section card ──────────────────────────────────────────────────────────────

function RiskSection({
    title,
    icon: Icon,
    count,
    loading,
    accentClass,
    children,
}: {
    title: string;
    icon: React.ElementType;
    count: number;
    loading: boolean;
    accentClass: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] overflow-hidden">
            <div className={`flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#1F1F23] ${accentClass}`}>
                <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold text-sm">{title}</span>
                </div>
                {loading
                    ? <Skeleton className="h-5 w-8" />
                    : <Badge variant="secondary" className="font-bold">{count}</Badge>}
            </div>
            {children}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SecurityRisksPage() {
    const navigate = useNavigate();

    const { equipments: risks, loading: risksLoading } = useSecurityRisks();
    const { equipments: noAv, loading: noAvLoading } = useEquipmentsWithoutAntivirus();
    const { equipments: pendingUpd, loading: pendingLoading } = useEquipmentsWithPendingUpdates();

    const goHistory = (id: number) => navigate(`/main/security/historial/${id}`);
    const goSnapshot = (id: number) => navigate(`/main/security/historial/${id}`);

    const totalAtRisk = new Set([
        ...risks.map(e => e.id),
        ...noAv.map(e => e.id),
        ...pendingUpd.map(e => e.id),
    ]).size;

    return (
        <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <ShieldAlert className="h-8 w-8 text-primary" />
                    Riesgos de Seguridad
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Equipos con vulnerabilidades activas detectadas por el agente de auditoría.
                </p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
                    <div className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
                        <ShieldAlert className="h-4 w-4" /> Con riesgo activo
                    </div>
                    <div className="text-2xl font-bold mt-1">
                        {risksLoading ? <Skeleton className="h-7 w-8" /> : risks.length}
                    </div>
                </div>
                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10">
                    <div className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <ShieldOff className="h-4 w-4" /> Sin antivirus activo
                    </div>
                    <div className="text-2xl font-bold mt-1">
                        {noAvLoading ? <Skeleton className="h-7 w-8" /> : noAv.length}
                    </div>
                </div>
                <div className="p-4 rounded-xl border border-orange-200 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-900/10">
                    <div className="text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                        <RefreshCw className="h-4 w-4" /> Con actualización crítica
                    </div>
                    <div className="text-2xl font-bold mt-1">
                        {pendingLoading ? <Skeleton className="h-7 w-8" /> : pendingUpd.length}
                    </div>
                </div>
            </div>

            {totalAtRisk > 0 && !risksLoading && !noAvLoading && !pendingLoading && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-400">
                        <span className="font-semibold">{totalAtRisk} equipo{totalAtRisk !== 1 ? 's' : ''}</span> con al menos un riesgo de seguridad detectado.
                    </p>
                </div>
            )}

            {/* Risk sections */}
            <RiskSection
                title="Equipos con riesgo de seguridad activo"
                icon={ShieldAlert}
                count={risks.length}
                loading={risksLoading}
                accentClass="bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400"
            >
                <RiskTable
                    equipments={risks}
                    loading={risksLoading}
                    onViewHistory={goHistory}
                    onViewSnapshot={goSnapshot}
                    emptyMessage="No hay equipos con riesgos de seguridad activos."
                />
            </RiskSection>

            <RiskSection
                title="Equipos sin antivirus activo"
                icon={ShieldOff}
                count={noAv.length}
                loading={noAvLoading}
                accentClass="bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400"
            >
                <RiskTable
                    equipments={noAv}
                    loading={noAvLoading}
                    onViewHistory={goHistory}
                    onViewSnapshot={goSnapshot}
                    emptyMessage="Todos los equipos tienen antivirus activo."
                />
            </RiskSection>

            <RiskSection
                title="Equipos con actualización crítica pendiente"
                icon={RefreshCw}
                count={pendingUpd.length}
                loading={pendingLoading}
                accentClass="bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-400"
            >
                <RiskTable
                    equipments={pendingUpd}
                    loading={pendingLoading}
                    onViewHistory={goHistory}
                    onViewSnapshot={goSnapshot}
                    emptyMessage="No hay actualizaciones críticas pendientes."
                />
            </RiskSection>
        </div>
    );
}
