import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { LaboratoryService } from '../services/laboratory.service';
import type { LaboratoryResponse, CreateLaboratoryRequest, UpdateLaboratoryRequest } from '../interfaces';

// ── GET ALL ──────────────────────────────────────────────────────────────────

export function useLaboratories() {
    const [laboratories, setLaboratories] = useState<LaboratoryResponse[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await LaboratoryService.getAll();
            setLaboratories(data);
        } catch {
            toast.error('Error al cargar laboratorios');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return { laboratories, loading, refetch: fetchAll };
}

// ── GET BY ID ─────────────────────────────────────────────────────────────────

export function useLaboratoryById(id: string) {
    const [laboratory, setLaboratory] = useState<LaboratoryResponse | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        LaboratoryService.getById(id)
            .then(setLaboratory)
            .catch(() => toast.error('Error al cargar laboratorio'))
            .finally(() => setLoading(false));
    }, [id]);

    return { laboratory, loading };
}

// ── ACTIONS (POST / PATCH) ────────────────────────────────────────────────────

export function useLaboratoryActions(onSuccess?: () => void) {
    const [loading, setLoading] = useState(false);

    const createLaboratory = async (data: CreateLaboratoryRequest): Promise<boolean> => {
        setLoading(true);
        try {
            await LaboratoryService.create(data);
            toast.success('Laboratorio creado exitosamente');
            onSuccess?.();
            return true;
        } catch {
            toast.error('Error al crear laboratorio');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateLaboratory = async (id: string, data: UpdateLaboratoryRequest): Promise<boolean> => {
        setLoading(true);
        try {
            await LaboratoryService.update(id, data);
            toast.success('Laboratorio actualizado');
            onSuccess?.();
            return true;
        } catch {
            toast.error('Error al actualizar laboratorio');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { createLaboratory, updateLaboratory, loading };
}
