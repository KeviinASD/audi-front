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
    MoreHorizontal,
    ShieldCheck,
    Building2,
    Trash2,
    Globe,
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
import type { AuthorizedSoftwareResponse } from '../../interfaces';

interface AuthorizedSoftwareTableProps {
    authorizedSoftware: AuthorizedSoftwareResponse[];
    loading: boolean;
}

export const AuthorizedSoftwareTable = ({ authorizedSoftware, loading }: AuthorizedSoftwareTableProps) => {
    if (loading && authorizedSoftware.length === 0) {
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
                        <TableHead className="w-[260px]">Software</TableHead>
                        <TableHead>Publisher</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Alcance</TableHead>
                        <TableHead>Fecha autorización</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {authorizedSoftware.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1F1F23]/30 transition-colors">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {item.name}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                {item.publisher ?? <span className="italic text-gray-400">—</span>}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500 max-w-[220px] truncate">
                                {item.description ?? <span className="italic text-gray-400">Sin descripción</span>}
                            </TableCell>
                            <TableCell>
                                {item.laboratoryId ? (
                                    <Badge variant="outline" className="font-normal border-gray-200 dark:border-gray-700 flex items-center gap-1 w-fit">
                                        <Building2 className="h-3 w-3" />
                                        Lab #{item.laboratoryId}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="font-normal bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 flex items-center gap-1 w-fit">
                                        <Globe className="h-3 w-3" />
                                        Global
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-xs text-gray-500">
                                {new Date(item.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Revocar acceso
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    {authorizedSoftware.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                No hay software autorizado registrado
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
