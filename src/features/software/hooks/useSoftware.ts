import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SoftwareService } from '../services/software.service';
import type { SoftwareInstalledResponse } from '../interfaces';

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
