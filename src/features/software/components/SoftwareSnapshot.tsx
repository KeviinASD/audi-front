import { useState, useMemo } from 'react';
import { useSoftwareByEquipment } from '../hooks/useSoftware';
import { LicenseStatus } from '../interfaces';
import type { SoftwareInstalledResponse } from '../interfaces';
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
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertTriangle,
    CalendarClock,
    CheckCircle2,
    Gift,
    HelpCircle,
    Info,
    Package,
    Search,
    ShieldAlert,
    ShieldCheck,
    ShieldOff,
    XCircle,
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

// ── Helpers ───────────────────────────────────────────────────────────────────

const licenseConfig: Record<LicenseStatus, { label: string; className: string }> = {
    [LicenseStatus.FREE]:       { label: 'Gratuito',      className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'                  },
    [LicenseStatus.LICENSED]:   { label: 'Licenciado',    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    [LicenseStatus.UNLICENSED]: { label: 'Sin licencia',  className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'                 },
    [LicenseStatus.UNKNOWN]:    { label: 'Desconocido',   className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'                 },
};

type FilterKey = 'all' | 'risk' | 'not-whitelisted' | 'licensed' | 'free' | 'unlicensed' | 'unknown';

const filterFns: Record<FilterKey, (s: SoftwareInstalledResponse) => boolean> = {
    'all':             () => true,
    'risk':            (s) => s.isRisk,
    'not-whitelisted': (s) => !s.isWhitelisted,
    'licensed':        (s) => s.licenseStatus === LicenseStatus.LICENSED,
    'free':            (s) => s.licenseStatus === LicenseStatus.FREE,
    'unlicensed':      (s) => s.licenseStatus === LicenseStatus.UNLICENSED,
    'unknown':         (s) => s.licenseStatus === LicenseStatus.UNKNOWN,
};

// ── Component ─────────────────────────────────────────────────────────────────

interface SoftwareSnapshotProps {
    equipmentId: number;
    equipmentName: string;
}

export const SoftwareSnapshot = ({ equipmentId, equipmentName }: SoftwareSnapshotProps) => {
    const { software, loading } = useSoftwareByEquipment(equipmentId);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

    const capturedAt = software[0]?.capturedAt;

    const stats = useMemo(() => ({
        total:          software.length,
        risk:           software.filter(s => s.isRisk).length,
        free:           software.filter(s => s.licenseStatus === LicenseStatus.FREE).length,
        licensed:       software.filter(s => s.licenseStatus === LicenseStatus.LICENSED).length,
        unlicensed:     software.filter(s => s.licenseStatus === LicenseStatus.UNLICENSED).length,
        unknown:        software.filter(s => s.licenseStatus === LicenseStatus.UNKNOWN).length,
        notWhitelisted: software.filter(s => !s.isWhitelisted).length,
    }), [software]);

    const filtered = useMemo(() => {
        return software
            .filter(filterFns[activeFilter])
            .filter(s =>
                search === '' ||
                s.name.toLowerCase().includes(search.toLowerCase()) ||
                s.publisher?.toLowerCase().includes(search.toLowerCase()) ||
                s.version?.toLowerCase().includes(search.toLowerCase())
            );
    }, [software, activeFilter, search]);

    if (loading) {
        return (
            <div className="space-y-4 pt-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 pt-2">

            {/* Snapshot header */}
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {equipmentName}
                </p>
                {capturedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <CalendarClock className="h-3.5 w-3.5" />
                        Snapshot capturado el {new Date(capturedAt).toLocaleString()}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-gray-200 dark:border-[#1F1F23] bg-gray-50 dark:bg-[#1F1F23]/50 flex items-center gap-3">
                    <Package className="h-5 w-5 text-gray-500" />
                    <div>
                        <p className="text-xs text-gray-500">Total instalado</p>
                        <p className="text-xl font-bold">{stats.total}</p>
                    </div>
                </div>
                <div className="p-3 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5 text-red-500" />
                    <div>
                        <div className="flex items-center gap-1 flex-1 justify-between w-full">
                            <p className="text-xs text-red-600 dark:text-red-400">En riesgo</p>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-3 w-3 text-red-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-56 text-center">
                                    Un software se marca en riesgo si no tiene fecha de instalación registrada o si la fecha de instalación superó los 6 meses.
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <p className="text-xl font-bold text-red-700 dark:text-red-400">{stats.risk}</p>
                    </div>
                </div>
                <div className="p-3 rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#16161a] col-span-2">
                    <div className="flex items-center gap-1.5 mb-3">
                        <ShieldOff className="h-3.5 w-3.5 text-gray-400" />
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            Estado de licencias
                        </p>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-100 dark:border-emerald-900/30">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 leading-none">{stats.licensed}</span>
                            <span className="text-[11px] text-emerald-600/80 dark:text-emerald-500/80 leading-tight">Licenciado</span>
                        </div>
                        <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-sky-50 dark:bg-sky-900/15 border border-sky-100 dark:border-sky-900/30">
                            <Gift className="h-3.5 w-3.5 text-sky-500" />
                            <span className="text-xl font-bold text-sky-700 dark:text-sky-400 leading-none">{stats.free}</span>
                            <span className="text-[11px] text-sky-600/80 dark:text-sky-500/80 leading-tight">Gratuito</span>
                        </div>
                        <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/15 border border-red-100 dark:border-red-900/30">
                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                            <span className="text-xl font-bold text-red-700 dark:text-red-400 leading-none">{stats.unlicensed}</span>
                            <span className="text-[11px] text-red-600/80 dark:text-red-500/80 leading-tight">Sin licencia</span>
                        </div>
                        <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/15 border border-amber-100 dark:border-amber-900/30">
                            <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-xl font-bold text-amber-700 dark:text-amber-400 leading-none">{stats.unknown}</span>
                            <span className="text-[11px] text-amber-600/80 dark:text-amber-500/80 leading-tight">Sin confirmar</span>
                        </div>
                    </div>
                </div>
                <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/10 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-blue-500" />
                    <div>
                        <p className="text-xs text-blue-600 dark:text-blue-400">No autorizados</p>
                        <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{stats.notWhitelisted}</p>
                    </div>
                </div>
            </div>

            {/* Filters + search */}
            <div className="flex flex-col gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por nombre, editor o versión..."
                        className="pl-9 text-sm"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {/* General filters */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        General
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {([
                            { key: 'all',             label: `Todo`,           count: stats.total          },
                            { key: 'risk',            label: `En riesgo`,      count: stats.risk           },
                            { key: 'not-whitelisted', label: `No autorizado`,  count: stats.notWhitelisted },
                        ] as const).map(({ key, label, count }) => (
                            <Button
                                key={key}
                                variant={activeFilter === key ? 'default' : 'outline'}
                                size="sm"
                                className="h-7 text-xs gap-1.5"
                                onClick={() => setActiveFilter(key)}
                            >
                                {label}
                                <span className={`rounded-full px-1.5 py-0 text-[10px] font-bold leading-4 ${
                                    activeFilter === key
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}>
                                    {count}
                                </span>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* License filters */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Licencia
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {([
                            { key: 'licensed',   label: 'Licenciado',   count: stats.licensed,   dot: 'bg-emerald-500' },
                            { key: 'free',       label: 'Gratuito',     count: stats.free,        dot: 'bg-sky-500'     },
                            { key: 'unlicensed', label: 'Sin licencia', count: stats.unlicensed,  dot: 'bg-red-500'     },
                            { key: 'unknown',    label: 'Sin confirmar',count: stats.unknown,     dot: 'bg-amber-500'   },
                        ] as const).map(({ key, label, count, dot }) => (
                            <Button
                                key={key}
                                variant={activeFilter === key ? 'default' : 'outline'}
                                size="sm"
                                className="h-7 text-xs gap-1.5"
                                onClick={() => setActiveFilter(key)}
                            >
                                <span className={`h-2 w-2 rounded-full shrink-0 ${dot}`} />
                                {label}
                                <span className={`rounded-full px-1.5 py-0 text-[10px] font-bold leading-4 ${
                                    activeFilter === key
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}>
                                    {count}
                                </span>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-gray-200 dark:border-[#1F1F23] overflow-auto">
                <Table>
                    <TableHeader className="bg-gray-50/80 dark:bg-[#1F1F23]/60">
                        <TableRow>
                            <TableHead className="w-[220px]">Software</TableHead>
                            <TableHead>Publisher</TableHead>
                            <TableHead>Instalado</TableHead>
                            <TableHead>Licencia</TableHead>
                            <TableHead className="text-center">Riesgo</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((item) => {
                            const license = licenseConfig[item.licenseStatus] ?? licenseConfig[LicenseStatus.UNKNOWN];
                            return (
                                <TableRow
                                    key={item.id}
                                    className={`transition-colors ${item.isRisk ? 'bg-red-50/40 dark:bg-red-900/5 hover:bg-red-50/60' : 'hover:bg-gray-50/50 dark:hover:bg-[#1F1F23]/30'}`}
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
                                        {item.isRisk ? (
                                            <AlertTriangle className="h-4 w-4 text-red-500 mx-auto" />
                                        ) : (
                                            <CheckCircle2 className="h-4 w-4 text-gray-300 dark:text-gray-600 mx-auto" />
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-20 text-center text-sm text-gray-500">
                                    {software.length === 0
                                        ? 'Sin datos de software para este equipo'
                                        : 'Ningún software coincide con los filtros'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
