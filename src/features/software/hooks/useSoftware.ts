import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SoftwareService } from '../services/software.service';
import type { SoftwareInstalledResponse, SnapshotHistoryEntry } from '../interfaces';

// ── GET LATEST SNAPSHOT BY EQUIPMENT ─────────────────────────────────────────

export function useSoftwareByEquipment(equipmentId: number) {
    const [software, setSoftware] = useState<SoftwareInstalledResponse[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLatest = useCallback(async () => {
        if (!equipmentId) return;
        setLoading(true);
        try {
            const data = await SoftwareService.getLatestByEquipment(equipmentId);
            setSoftware(data);
        } catch {
            toast.error('Error al cargar el software instalado');
        } finally {
            setLoading(false);
        }
    }, [equipmentId]);

    useEffect(() => {
        fetchLatest();
    }, [fetchLatest]);

    return { software, loading, refetch: fetchLatest };
}

// ── GET SNAPSHOT HISTORY BY EQUIPMENT ────────────────────────────────────────

export function useSoftwareHistory(equipmentId: number) {
    const [history, setHistory] = useState<SnapshotHistoryEntry[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchHistory = useCallback(async () => {
        if (!equipmentId) return;
        setLoading(true);
        try {
            const data = await SoftwareService.getHistory(equipmentId);
            const sorted = [...data].sort(
                (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
            );
            setHistory(sorted);
        } catch {
            toast.error('Error al cargar el historial de snapshots');
        } finally {
            setLoading(false);
        }
    }, [equipmentId]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { history, loading, refetch: fetchHistory };
}
