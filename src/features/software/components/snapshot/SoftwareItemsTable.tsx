import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { LicenseStatus } from '../../interfaces';
import type { SoftwareInstalledResponse } from '../../interfaces';

const licenseConfig: Record<LicenseStatus, { label: string; className: string }> = {
    [LicenseStatus.LICENSED]:   { label: 'Licenciado',   className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    [LicenseStatus.UNLICENSED]: { label: 'Sin licencia', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'                 },
    [LicenseStatus.UNKNOWN]:    { label: 'Desconocido',  className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'                 },
};

interface SoftwareItemsTableProps {
    items: SoftwareInstalledResponse[];
}

export const SoftwareItemsTable = ({ items }: SoftwareItemsTableProps) => (
    <Table>
        <TableHeader className="bg-gray-50/50 dark:bg-[#1F1F23]/50">
            <TableRow>
                <TableHead className="w-[220px]">Software</TableHead>
                <TableHead>Publisher</TableHead>
                <TableHead>Instalado</TableHead>
                <TableHead>Licencia</TableHead>
                <TableHead className="text-center w-[80px]">Riesgo</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {items.map((item) => {
                const license = licenseConfig[item.licenseStatus] ?? licenseConfig[LicenseStatus.UNKNOWN];
                return (
                    <TableRow
                        key={item.id}
                        className={`transition-colors ${item.isRisk
                            ? 'bg-red-50/40 dark:bg-red-900/5 hover:bg-red-50/60'
                            : 'hover:bg-gray-50/50 dark:hover:bg-[#1F1F23]/30'
                        }`}
                    >
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm text-gray-900 dark:text-gray-100 leading-tight">
                                    {item.name}
                                </span>
                                {item.version && (
                                    <span className="text-xs text-gray-400 font-mono mt-0.5">
                                        v{item.version}
                                    </span>
                                )}
                            </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                            {item.publisher ?? <span className="italic text-gray-400">—</span>}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                            {item.installedAt
                                ? new Date(item.installedAt).toLocaleDateString()
                                : <span className="italic text-gray-400">—</span>
                            }
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline" className={`${license.className} border-none text-xs`}>
                                {license.label}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                            {item.isRisk
                                ? <AlertTriangle className="h-4 w-4 text-red-500 mx-auto" />
                                : <CheckCircle2 className="h-4 w-4 text-gray-300 dark:text-gray-600 mx-auto" />
                            }
                        </TableCell>
                    </TableRow>
                );
            })}
            {items.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="h-16 text-center text-sm text-gray-500">
                        Sin items en este snapshot
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    </Table>
);
