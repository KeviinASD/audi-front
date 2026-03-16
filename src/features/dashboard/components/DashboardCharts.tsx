import { useMemo } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    Legend,
    CartesianGrid,
} from 'recharts';
import type { EquipmentResponse } from '@/features/equipos/interfaces';
import { getDisplayStatus } from '@/features/equipos/utils/equipment-status';

const STATUS_COLORS: Record<string, string> = {
    operativo: '#10b981',
    conectado: '#0ea5e9',
    degradado: '#f59e0b',
    critico: '#ef4444',
    'sin-datos': '#94a3b8',
};

type EquipmentWithDisplayStatus = EquipmentResponse & { displayStatus?: string };

export function ChartDistributionByStatus({
    equipments,
    loading,
}: {
    equipments: EquipmentWithDisplayStatus[];
    loading: boolean;
}) {
    const data = useMemo(() => {
        const counts: Record<string, number> = {
            operativo: 0,
            conectado: 0,
            degradado: 0,
            critico: 0,
            'sin-datos': 0,
        };
        equipments.forEach((e) => {
            const s = e.displayStatus ?? getDisplayStatus(e);
            counts[s] = (counts[s] ?? 0) + 1;
        });
        return [
            { name: 'Operativos', value: counts.operativo, status: 'operativo' },
            { name: 'Conectados', value: counts.conectado, status: 'conectado' },
            { name: 'Degradados', value: counts.degradado, status: 'degradado' },
            { name: 'Críticos', value: counts.critico, status: 'critico' },
            { name: 'Sin datos', value: counts['sin-datos'], status: 'sin-datos' },
        ].filter((d) => d.value > 0);
    }, [equipments]);

    if (loading) return <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm">Cargando…</div>;
    if (data.length === 0) return <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm">Sin datos</div>;

    return (
        <ResponsiveContainer width="100%" height={240}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={88}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                    {data.map((entry, index) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#94a3b8'} stroke="white" strokeWidth={2} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, 'Equipos']} />
            </PieChart>
        </ResponsiveContainer>
    );
}

export function ChartEquipmentsByLaboratory({
    equipments,
    laboratories,
    loading,
}: {
    equipments: EquipmentWithDisplayStatus[];
    laboratories: { id: number; name: string }[];
    loading: boolean;
}) {
    const data = useMemo(() => {
        const byLab: Record<number | 'none', { name: string; operativo: number; conectado: number; degradado: number; critico: number; sinDatos: number; total: number }> = {};
        laboratories.forEach((lab) => {
            byLab[lab.id] = {
                name: lab.name.length > 18 ? lab.name.slice(0, 18) + '…' : lab.name,
                operativo: 0,
                conectado: 0,
                degradado: 0,
                critico: 0,
                sinDatos: 0,
                total: 0,
            };
        });
        if (!byLab['none']) byLab['none'] = { name: 'Sin asignar', operativo: 0, conectado: 0, degradado: 0, critico: 0, sinDatos: 0, total: 0 };
        equipments.forEach((e) => {
            const key: number | 'none' = e.laboratory?.id ?? 'none';
            if (!byLab[key]) {
                byLab[key] = {
                    name: e.laboratory?.name ?? 'Sin asignar',
                    operativo: 0,
                    conectado: 0,
                    degradado: 0,
                    critico: 0,
                    sinDatos: 0,
                    total: 0,
                };
            }
            byLab[key].total++;
            const s = e.displayStatus ?? getDisplayStatus(e);
            if (s === 'operativo') byLab[key].operativo++;
            else if (s === 'conectado') byLab[key].conectado++;
            else if (s === 'degradado') byLab[key].degradado++;
            else if (s === 'critico') byLab[key].critico++;
            else byLab[key].sinDatos++;
        });
        return Object.entries(byLab)
            .filter(([, v]) => v.total > 0)
            .map(([id, v]) => ({ ...v, id: id === 'none' ? 0 : Number(id) }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);
    }, [equipments, laboratories]);

    if (loading) return <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">Cargando…</div>;
    if (data.length === 0) return <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">Sin datos por laboratorio</div>;

    return (
        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    formatter={(value: number) => [value, '']}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.name && `Laboratorio: ${payload[0].payload.name}`}
                />
                <Legend />
                <Bar dataKey="operativo" stackId="a" fill="#10b981" name="Operativos" radius={[0, 0, 0, 0]} />
                <Bar dataKey="conectado" stackId="a" fill="#0ea5e9" name="Conectados" radius={[0, 0, 0, 0]} />
                <Bar dataKey="degradado" stackId="a" fill="#f59e0b" name="Degradados" radius={[0, 0, 0, 0]} />
                <Bar dataKey="critico" stackId="a" fill="#ef4444" name="Críticos" radius={[0, 0, 0, 0]} />
                <Bar dataKey="sinDatos" stackId="a" fill="#94a3b8" name="Sin datos" radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
