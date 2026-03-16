import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Building2, Filter, X } from 'lucide-react';

export type DashboardLabFilter = number | 'all';
export type DashboardStatusFilter = 'all' | 'operativo' | 'degradado' | 'critico' | 'conectado' | 'sin-datos';

export interface DashboardFiltersProps {
    labId: DashboardLabFilter;
    onLabChange: (value: DashboardLabFilter) => void;
    statusFilter: DashboardStatusFilter;
    onStatusFilterChange: (value: DashboardStatusFilter) => void;
    laboratories: { id: number; name: string; location?: string }[];
    labsLoading: boolean;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

const STATUS_OPTIONS: { value: DashboardStatusFilter; label: string }[] = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'operativo', label: 'Operativos' },
    { value: 'conectado', label: 'Conectados' },
    { value: 'degradado', label: 'Degradados' },
    { value: 'critico', label: 'Críticos' },
    { value: 'sin-datos', label: 'Sin datos' },
];

export function DashboardFilters({
    labId,
    onLabChange,
    statusFilter,
    onStatusFilterChange,
    laboratories,
    labsLoading,
    hasActiveFilters,
    onClearFilters,
}: DashboardFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Filter className="h-4 w-4 shrink-0" />
                <span className="font-medium">Filtros</span>
            </div>
            <Select
                value={labId === 'all' ? 'all' : String(labId)}
                onValueChange={(v) => onLabChange(v === 'all' ? 'all' : Number(v))}
            >
                <SelectTrigger className="w-[220px] h-9 text-sm bg-white dark:bg-[#16161a] border-gray-200 dark:border-[#1F1F23]">
                    <Building2 className="h-3.5 w-3.5 mr-2 text-gray-400 shrink-0" />
                    <SelectValue placeholder="Laboratorio" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los laboratorios</SelectItem>
                    {labsLoading ? (
                        <SelectItem value="loading" disabled>Cargando…</SelectItem>
                    ) : (
                        laboratories.map((l) => (
                            <SelectItem key={l.id} value={String(l.id)}>
                                {l.name}
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as DashboardStatusFilter)}>
                <SelectTrigger className="w-[180px] h-9 text-sm bg-white dark:bg-[#16161a] border-gray-200 dark:border-[#1F1F23]">
                    <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={onClearFilters}
                >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Limpiar filtros
                </Button>
            )}
        </div>
    );
}
