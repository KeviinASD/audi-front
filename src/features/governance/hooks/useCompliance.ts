import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { ComplianceService } from '../services/compliance.service';
import type {
    ParkComplianceResponse,
    EquipmentComplianceResponse,
} from '../interfaces';

function describeError(error: unknown): string {
    const err = error as { response?: { status?: number }; code?: string };
    if (err?.code === 'ECONNABORTED') {
        return 'La evaluación tardó demasiado y se canceló. Revisá el log del backend.';
    }
    if (err?.response?.status === 500) {
        return 'El backend falló al evaluar. Revisá el log del servidor para ver qué equipo lo rompió.';
    }
    if (!err?.response) {
        return 'No se pudo contactar al backend. ¿Está levantado en el puerto configurado?';
    }
    return `El backend respondió con estado ${err.response.status}.`;
}

// ── Cumplimiento del parque completo ─────────────────────────────────────────

export function useParkCompliance() {
    const [data, setData] = useState<ParkComplianceResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPark = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await ComplianceService.getPark();
            setData(result);
        } catch (err) {
            const message = describeError(err);
            setError(message);
            toast.error('Error al evaluar el cumplimiento', { description: message });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPark();
    }, [fetchPark]);

    return { data, loading, error, refetch: fetchPark };
}

// ── Cumplimiento de un equipo ────────────────────────────────────────────────

export function useEquipmentCompliance(equipmentId: number | null) {
    const [data, setData] = useState<EquipmentComplianceResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEquipment = useCallback(async () => {
        if (equipmentId === null) {
            setData(null);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await ComplianceService.getByEquipment(equipmentId);
            setData(result);
        } catch (err) {
            const message = describeError(err);
            setError(message);
            toast.error('Error al evaluar el equipo', { description: message });
        } finally {
            setLoading(false);
        }
    }, [equipmentId]);

    useEffect(() => {
        fetchEquipment();
    }, [fetchEquipment]);

    return { data, loading, error, refetch: fetchEquipment };
}
