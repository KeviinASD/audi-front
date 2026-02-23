import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { HardwareService } from '../services/hardware.service';
import type { HardwareSnapshotResponse } from '../interfaces';

// ── GET LATEST SNAPSHOT ───────────────────────────────────────────────────────

export function useLatestHardware(equipmentId: number) {
    const [snapshot, setSnapshot] = useState<HardwareSnapshotResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchLatest = useCallback(async () => {
        if (!equipmentId) return;
        setLoading(true);
        try {
            const data = await HardwareService.getLatest(equipmentId);
            setSnapshot(data);
        } catch {
            toast.error('Error al cargar el snapshot de hardware');
        } finally {
            setLoading(false);
        }
    }, [equipmentId]);

    useEffect(() => {
        fetchLatest();
    }, [fetchLatest]);

    return { snapshot, loading, refetch: fetchLatest };
}

// ── GET HISTORY BY DATE RANGE ─────────────────────────────────────────────────

export function useHardwareHistory(equipmentId: number, from: Date, to: Date) {
    const [history, setHistory] = useState<HardwareSnapshotResponse[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchHistory = useCallback(async () => {
        if (!equipmentId) return;
        setLoading(true);
        try {
            const data = await HardwareService.getHistory(equipmentId, from, to);
            const sorted = [...data].sort(
                (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
            );
            setHistory(sorted);
        } catch {
            toast.error('Error al cargar el historial de hardware');
        } finally {
            setLoading(false);
        }
    }, [equipmentId, from, to]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { history, loading, refetch: fetchHistory };
}
