import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { EquipmentService } from '../services/equipment.service';
import type { EquipmentResponse, CreateEquipmentRequest, UpdateEquipmentRequest } from '../interfaces';

// ── GET ALL ──────────────────────────────────────────────────────────────────

export function useEquipments() {
    const [equipments, setEquipments] = useState<EquipmentResponse[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await EquipmentService.getAll();
            setEquipments(data);
        } catch {
            toast.error('Error al cargar equipos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return { equipments, loading, refetch: fetchAll };
}

// ── GET BY ID ─────────────────────────────────────────────────────────────────

export function useEquipmentById(id: number) {
    const [equipment, setEquipment] = useState<EquipmentResponse | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        EquipmentService.getById(id)
            .then(setEquipment)
            .catch(() => toast.error('Error al cargar equipo'))
            .finally(() => setLoading(false));
    }, [id]);

    return { equipment, loading };
}

// ── ACTIONS (POST / PATCH / DELETE) ──────────────────────────────────────────

export function useEquipmentActions(onSuccess?: () => void) {
    const [loading, setLoading] = useState(false);

    const createEquipment = async (data: CreateEquipmentRequest): Promise<boolean> => {
        setLoading(true);
        try {
            await EquipmentService.create(data);
            toast.success('Equipo registrado exitosamente');
            onSuccess?.();
            return true;
        } catch {
            toast.error('Error al registrar equipo');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateEquipment = async (id: number, data: UpdateEquipmentRequest): Promise<boolean> => {
        setLoading(true);
        try {
            await EquipmentService.update(id, data);
            toast.success('Equipo actualizado');
            onSuccess?.();
            return true;
        } catch {
            toast.error('Error al actualizar equipo');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteEquipment = async (id: number): Promise<boolean> => {
        setLoading(true);
        try {
            await EquipmentService.delete(id);
            toast.success('Equipo eliminado');
            onSuccess?.();
            return true;
        } catch {
            toast.error('Error al eliminar equipo');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { createEquipment, updateEquipment, deleteEquipment, loading };
}
