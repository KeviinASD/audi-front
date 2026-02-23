import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EquipmentTable } from '../components/equipos/EquipmentTable';
import { EquipmentForm } from '../components/equipos/EquipmentForm';
import { SoftwareSnapshot } from '@/features/software/components/SoftwareSnapshot';
import { HardwareSnapshot, HardwareSnapshotSkeleton } from '@/features/hardware/components/snapshot/HardwareSnapshot';
import { useLatestHardware } from '@/features/hardware/hooks/useHardware';
import { Monitor, Filter, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { useEquipments } from '../hooks/useEquipment';
import type { EquipmentResponse } from '../interfaces';

export default function EquiposPage() {
    const navigate = useNavigate();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<EquipmentResponse | null>(null);
    const [selectedHardwareEquipment, setSelectedHardwareEquipment] = useState<EquipmentResponse | null>(null);
    const { equipments, loading, refetch } = useEquipments();
    const { snapshot: hardwareSnapshot, loading: hardwareLoading } = useLatestHardware(
        selectedHardwareEquipment?.id ?? 0
    );

    const handleCreateSuccess = () => {
        setIsCreateOpen(false);
        refetch();
    };

    const operativos = equipments.filter(e => e.status === 'operativo').length;
    const degradados = equipments.filter(e => e.status === 'degradado').length;
    const criticos = equipments.filter(e => e.status === 'critico').length;

    return (
        <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <Monitor className="h-8 w-8 text-primary" />
                        Catálogo de Equipos
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Listado de máquinas registradas y auditadas por el sistema.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por nombre o código..."
                            className="pl-10 bg-white dark:bg-[#16161a] border-gray-200 dark:border-[#1F1F23]"
                        />
                    </div>
                    <Button variant="outline" size="icon" className="border-gray-200 dark:border-[#1F1F23]">
                        <Filter className="h-4 w-4" />
                    </Button>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95">
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo Equipo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Registrar Equipo</DialogTitle>
                                <DialogDescription>
                                    Completa los datos para registrar un nuevo equipo en el sistema.
                                </DialogDescription>
                            </DialogHeader>
                            <EquipmentForm onSuccess={handleCreateSuccess} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-emerald-50/50 dark:bg-emerald-900/10">
                    <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Operativos</div>
                    <div className="text-2xl font-bold mt-1">{operativos}</div>
                </div>
                <div className="p-4 rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-amber-50/50 dark:bg-amber-900/10">
                    <div className="text-sm font-medium text-amber-600 dark:text-amber-400">Degradados</div>
                    <div className="text-2xl font-bold mt-1">{degradados}</div>
                </div>
                <div className="p-4 rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-red-50/50 dark:bg-red-900/10">
                    <div className="text-sm font-medium text-red-600 dark:text-red-400">Críticos</div>
                    <div className="text-2xl font-bold mt-1">{criticos}</div>
                </div>
            </div>

            {/* Table */}
            <EquipmentTable
                equipments={equipments}
                loading={loading}
                onViewSoftware={setSelectedEquipment}
                onViewSoftwareHistory={(eq) => navigate(`/main/software/historial/${eq.id}`)}
                onViewHardware={setSelectedHardwareEquipment}
                onViewHardwareHistory={(eq) => navigate(`/main/hardware/historial/${eq.id}`)}
            />

            {/* Software analysis sheet */}
            <Sheet
                open={!!selectedEquipment}
                onOpenChange={(open) => { if (!open) setSelectedEquipment(null); }}
            >
                <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Análisis de Software</SheetTitle>
                        <SheetDescription>
                            Software instalado detectado en el último snapshot del agente.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="px-4">
                        {selectedEquipment && (
                            <SoftwareSnapshot
                                equipmentId={selectedEquipment.id}
                                equipmentName={`${selectedEquipment.name} — ${selectedEquipment.code}`}
                            />
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Hardware snapshot sheet */}
            <Sheet
                open={!!selectedHardwareEquipment}
                onOpenChange={(open) => { if (!open) setSelectedHardwareEquipment(null); }}
            >
                <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Hardware — Último Snapshot</SheetTitle>
                        <SheetDescription>
                            {selectedHardwareEquipment
                                ? `${selectedHardwareEquipment.name} — ${selectedHardwareEquipment.code}`
                                : 'Información de hardware del equipo.'}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="px-4 pt-2">
                        {hardwareLoading && <HardwareSnapshotSkeleton />}
                        {!hardwareLoading && hardwareSnapshot && (
                            <HardwareSnapshot snapshot={hardwareSnapshot} />
                        )}
                        {!hardwareLoading && !hardwareSnapshot && (
                            <p className="text-sm text-gray-400 italic pt-4">
                                Sin datos de hardware disponibles.
                            </p>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
