import { useEffect, useState } from 'react';
import { PerformanceService } from '../services/performance.service';
import type {
    PerformanceSnapshotResponse,
    PerformanceAveragesResponse,
    PerformanceAlertEquipmentResponse,
} from '../interfaces';

export function useLatestPerformance(equipmentId: number) {
    const [snapshot, setSnapshot] = useState<PerformanceSnapshotResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const fetch = async () => {
        if (!equipmentId) return;
        setLoading(true);
        try {
            const data = await PerformanceService.getLatest(equipmentId);
            setSnapshot(data);
        } catch {
            setSnapshot(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetch(); }, [equipmentId]);

    return { snapshot, loading, refetch: fetch };
}

export function usePerformanceHistory(equipmentId: number, from: Date, to: Date) {
    const [history, setHistory] = useState<PerformanceSnapshotResponse[]>([]);
    const [loading, setLoading] = useState(false);

    const fromISO = from.toISOString();
    const toISO = to.toISOString();

    const fetch = async () => {
        if (!equipmentId) return;
        setLoading(true);
        try {
            const data = await PerformanceService.getHistory(equipmentId, from, to);
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

    useEffect(() => { fetch(); }, [equipmentId, fromISO, toISO]);

    return { history, loading, refetch: fetch };
}

export function usePerformanceAverages(equipmentId: number, from: Date, to: Date) {
    const [averages, setAverages] = useState<PerformanceAveragesResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const fromISO = from.toISOString();
    const toISO = to.toISOString();

    const fetch = async () => {
        if (!equipmentId) return;
        setLoading(true);
        try {
            const data = await PerformanceService.getAverages(equipmentId, from, to);
            setAverages(data);
        } catch {
            setAverages(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetch(); }, [equipmentId, fromISO, toISO]);

    return { averages, loading, refetch: fetch };
}

export function usePerformanceAlerts() {
    const [equipments, setEquipments] = useState<PerformanceAlertEquipmentResponse[]>([]);
    const [loading, setLoading] = useState(false);

    const fetch = async () => {
        setLoading(true);
        try {
            const data = await PerformanceService.getEquipmentsWithAlerts();
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
