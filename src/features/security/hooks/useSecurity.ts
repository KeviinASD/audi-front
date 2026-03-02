import { useEffect, useMemo, useState } from 'react';
import { SecurityService } from '../services/security.service';
import type {
    SecuritySnapshotResponse,
    SecurityRiskEquipmentResponse,
} from '../interfaces';

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
            setEquipments(data);
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
            setEquipments(data);
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
            setEquipments(data);
        } catch {
            setEquipments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetch(); }, []);

    return { equipments, loading, refetch: fetch };
}
