import { useEffect } from 'react';
import { useEquiposStore } from '../../store/equipos.store';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Edit,
    Trash2,
    MoreHorizontal,
    Plus,
    Building2,
    Mail,
    User
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export const LabTable = () => {
    const { laboratorios, loading, fetchLaboratorios } = useEquiposStore();

    useEffect(() => {
        fetchLaboratorios();
    }, [fetchLaboratorios]);

    if (loading && laboratorios.length === 0) {
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
                        <TableHead className="w-[300px]">Nombre / Ubicación</TableHead>
                        <TableHead>Responsable</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {laboratorios.map((lab) => (
                        <TableRow key={lab.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1F1F23]/30 transition-colors">
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{lab.name}</span>
                                    <span className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                        <Building2 className="h-3 w-3" />
                                        {lab.location || 'Sin ubicación'}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="text-sm">{lab.responsible || 'No asignado'}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                {lab.responsibleEmail ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Mail className="h-3 w-3" />
                                        {lab.responsibleEmail}
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-400 italic">N/A</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge variant={lab.isActive ? "default" : "secondary"} className={lab.isActive ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}>
                                    {lab.isActive ? "Activo" : "Inactivo"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="cursor-pointer">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Desactivar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    {laboratorios.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                No hay laboratorios registrados
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
