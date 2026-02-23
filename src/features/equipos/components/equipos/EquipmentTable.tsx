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
import {
    Monitor,
    MoreHorizontal,
    MapPin,
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Info,
    Building2,
    Trash2,
    ScanSearch,
    History,
    Cpu,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import type { EquipmentResponse, EquipmentStatus } from '../../interfaces';

const statusConfig: Record<EquipmentStatus, { label: string; color: string; icon: any }> = {
    'operativo': { label: 'Operativo', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
    'degradado': { label: 'Degradado', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',         icon: AlertCircle  },
    'critico':   { label: 'Crítico',   color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',                 icon: XCircle      },
    'sin-datos': { label: 'Sin datos', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',                icon: Info         },
};

interface EquipmentTableProps {
    equipments: EquipmentResponse[];
    loading: boolean;
    onViewSoftware: (equipment: EquipmentResponse) => void;
    onViewSoftwareHistory: (equipment: EquipmentResponse) => void;
    onViewHardware: (equipment: EquipmentResponse) => void;
    onViewHardwareHistory: (equipment: EquipmentResponse) => void;
}

export const EquipmentTable = ({
    equipments,
    loading,
    onViewSoftware,
    onViewSoftwareHistory,
    onViewHardware,
    onViewHardwareHistory,
}: EquipmentTableProps) => {
    if (loading && equipments.length === 0) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] overflow-hidden">
            <Table>
                <TableHeader className="bg-gray-50/50 dark:bg-[#1F1F23]/50">
                    <TableRow>
                        <TableHead className="w-[260px]">Equipo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Laboratorio</TableHead>
                        <TableHead>Última conexión</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {equipments.map((eq) => {
                        const status = statusConfig[eq.status] ?? statusConfig['sin-datos'];
                        const StatusIcon = status.icon;

                        return (
                            <TableRow key={eq.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1F1F23]/30 transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-[#1F1F23] flex items-center justify-center">
                                            <Monitor className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{eq.name}</span>
                                            <span className="text-xs text-gray-400 font-mono mt-0.5">{eq.code}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`${status.color} border-none flex items-center w-fit gap-1 pr-2`}>
                                        <StatusIcon className="h-3 w-3" />
                                        {status.label}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                                        <MapPin className="h-3 w-3 shrink-0" />
                                        {eq.ubication || <span className="italic text-gray-400">Sin ubicación</span>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {eq.laboratory ? (
                                        <Badge variant="outline" className="font-normal border-gray-200 dark:border-gray-700 flex items-center gap-1 w-fit">
                                            <Building2 className="h-3 w-3" />
                                            {eq.laboratory.name}
                                        </Badge>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Sin asignar</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        {eq.lastConnection
                                            ? new Date(eq.lastConnection).toLocaleString()
                                            : 'Nunca'}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-52">
                                            <DropdownMenuLabel>Software</DropdownMenuLabel>
                                            <DropdownMenuItem
                                                className="cursor-pointer"
                                                onClick={() => onViewSoftware(eq)}
                                            >
                                                <ScanSearch className="mr-2 h-4 w-4" />
                                                Analizar Software
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="cursor-pointer"
                                                onClick={() => onViewSoftwareHistory(eq)}
                                            >
                                                <History className="mr-2 h-4 w-4" />
                                                Historial Software
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel>Hardware</DropdownMenuLabel>
                                            <DropdownMenuItem
                                                className="cursor-pointer"
                                                onClick={() => onViewHardware(eq)}
                                            >
                                                <Cpu className="mr-2 h-4 w-4" />
                                                Ver Hardware
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="cursor-pointer"
                                                onClick={() => onViewHardwareHistory(eq)}
                                            >
                                                <History className="mr-2 h-4 w-4" />
                                                Historial Hardware
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="cursor-pointer">
                                                <Info className="mr-2 h-4 w-4" />
                                                Ver Detalles
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer">
                                                <Building2 className="mr-2 h-4 w-4" />
                                                Asignar Lab
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {equipments.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                No hay equipos registrados
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
