import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { GovernanceThresholdService } from '../services/governance-threshold.service';
import type {
    GroupedThresholdsResponse,
    SeverityMatrixEntry,
    UpdateThresholdRequest,
} from '../interfaces';

// ── GET ALL (agrupado) ───────────────────────────────────────────────────────

export function useGovernanceThresholds() {
    const [data, setData] = useState<GroupedThresholdsResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const result = await GovernanceThresholdService.getGrouped();
            setData(result);
        } catch {
            toast.error('Error al cargar los umbrales de gobierno');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return { data, loading, refetch: fetchAll };
}

// ── GET severity matrix ──────────────────────────────────────────────────────

export function useSeverityMatrix() {
    const [matrix, setMatrix] = useState<SeverityMatrixEntry[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchMatrix = useCallback(async () => {
        setLoading(true);
        try {
            const result = await GovernanceThresholdService.getSeverityMatrix();
            setMatrix(result);
        } catch {
            toast.error('Error al cargar la matriz de severidad');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMatrix();
    }, [fetchMatrix]);

    return { matrix, loading };
}

// ── ACTIONS (PATCH / POST) ───────────────────────────────────────────────────

export function useGovernanceThresholdActions(onSuccess?: () => void) {
    const [loading, setLoading] = useState(false);

    const updateThreshold = async (
        id: number,
        data: UpdateThresholdRequest,
    ): Promise<boolean> => {
        setLoading(true);
        try {
            await GovernanceThresholdService.update(id, data);
            toast.success('Umbral actualizado', {
                description: 'Al cambiar el valor se revoca la aprobación anterior. Volvé a aprobarlo.',
            });
            onSuccess?.();
            return true;
        } catch {
            toast.error('Error al actualizar el umbral');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const approveThreshold = async (id: number, approvedBy: string): Promise<boolean> => {
        setLoading(true);
        try {
            await GovernanceThresholdService.approve(id, { approvedBy });
            toast.success('Umbral aprobado', {
                description: 'Queda registrado quién asumió la decisión y cuándo.',
            });
            onSuccess?.();
            return true;
        } catch {
            toast.error('Error al aprobar el umbral');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { updateThreshold, approveThreshold, loading };
}
