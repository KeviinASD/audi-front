import type { EquipmentResponse } from '../interfaces';

/** Estados que puede devolver la API (español o legacy en inglés). */
const API_TO_SPANISH: Record<string, string> = {
    operativo: 'operativo',
    degradado: 'degradado',
    critico: 'critico',
    'sin-datos': 'sin-datos',
    conectado: 'conectado',
    operative: 'operativo',
    degraded: 'degradado',
    critical: 'critico',
    'no-data': 'sin-datos',
};

export type DisplayStatus = 'operativo' | 'degradado' | 'critico' | 'conectado' | 'sin-datos';

/**
 * Normaliza el status de la API a español y, si es "sin-datos" pero hay última conexión,
 * devuelve "conectado" para no mostrar "Sin datos" cuando sí hay actividad.
 */
export function getDisplayStatus(e: Pick<EquipmentResponse, 'status' | 'lastConnection'>): DisplayStatus {
    const raw = (e.status ?? 'sin-datos').toLowerCase();
    const normalized = (API_TO_SPANISH[raw] ?? 'sin-datos') as DisplayStatus;
    if (normalized === 'sin-datos' && e.lastConnection) return 'conectado';
    return normalized;
}

/** Lista de equipos con status de visualización consistente (español + conectado cuando aplica). */
export function equipmentsWithDisplayStatus(
    list: EquipmentResponse[],
): (EquipmentResponse & { displayStatus: DisplayStatus })[] {
    return list.map((e) => ({ ...e, displayStatus: getDisplayStatus(e) }));
}
