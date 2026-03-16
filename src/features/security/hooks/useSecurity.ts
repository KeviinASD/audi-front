import { useEffect, useState } from 'react';
import { SecurityService } from '../services/security.service';
import type {
    SecuritySnapshotResponse,
    SecurityRiskEquipmentResponse,
} from '../interfaces';

/** Normaliza respuesta del API: acepta lista plana (id, name, ubication, status) o snapshots con equipment anidado */
function normalizeRiskEquipments(
    data: SecurityRiskEquipmentResponse[] | Array<{ equipment?: { id: number; code?: string; name?: string; ubication?: string; status?: string; lastConnection?: string }; id?: number }>
): SecurityRiskEquipmentResponse[] {
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => {
        const eq = item.equipment;
        if (eq) {
            return {
                id: eq.id,
                code: eq.code ?? '',
                name: eq.name ?? '',
                ubication: eq.ubication ?? undefined,
                status: eq.status ?? 'sin-datos',
                lastConnection: eq.lastConnection,
            };
        }
        return {
            id: item.id,
            code: item.code ?? '',
            name: item.name ?? '',
            ubication: item.ubication ?? undefined,
            status: item.status ?? 'sin-datos',
            lastConnection: item.lastConnection,
        };
    });
}

export function useLatestSecurity(equipmentId: number) {
    const [snapshot, setSnapshot] = useState<SecuritySnapshotResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const fetch = async () => {
        if (!equipmentId) return;
        setLoading(true);
        try {
            const data = await SecurityService.getLatest(equipmentId);
            setSnapshot(data);
        } catch {
            setSnapshot(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, [equipmentId]);

    return { snapshot, loading, refetch: fetch };
}

export function useSecurityHistory(equipmentId: number, from: Date, to: Date) {
    const [history, setHistory] = useState<SecuritySnapshotResponse[]>([]);
    const [loading, setLoading] = useState(false);

    const fromISO = from.toISOString();
    const toISO = to.toISOString();

    const fetch = async () => {
        if (!equipmentId) return;
        setLoading(true);
        try {
            const data = await SecurityService.getHistory(equipmentId, from, to);
            const sorted = [...data].sort(
                (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
            );
            setHistory(sorted);
        } catch {
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, [equipmentId, fromISO, toISO]);

    return { history, loading, refetch: fetch };
}

export function useSecurityRisks() {
    const [equipments, setEquipments] = useState<SecurityRiskEquipmentResponse[]>([]);
    const [loading, setLoading] = useState(false);

    const fetch = async () => {
        setLoading(true);
        try {
            const data = await SecurityService.getEquipmentsWithRisk();
            setEquipments(normalizeRiskEquipments(data as any));
        } catch {
            setEquipments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetch(); }, []);

    return { equipments, loading, refetch: fetch };
}

export function useEquipmentsWithoutAntivirus() {
    const [equipments, setEquipments] = useState<SecurityRiskEquipmentResponse[]>([]);
    const [loading, setLoading] = useState(false);

    const fetch = async () => {
        setLoading(true);
        try {
            const data = await SecurityService.getEquipmentsWithoutAntivirus();
            setEquipments(normalizeRiskEquipments(data as any));
        } catch {
            setEquipments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetch(); }, []);

    return { equipments, loading, refetch: fetch };
}

export function useEquipmentsWithPendingUpdates() {
    const [equipments, setEquipments] = useState<SecurityRiskEquipmentResponse[]>([]);
    const [loading, setLoading] = useState(false);

    const fetch = async () => {
        setLoading(true);
        try {
            const data = await SecurityService.getEquipmentsWithPendingUpdates();
            setEquipments(normalizeRiskEquipments(data as any));
        } catch {
            setEquipments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetch(); }, []);

    return { equipments, loading, refetch: fetch };
}
