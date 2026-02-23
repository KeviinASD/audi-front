import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SoftwareService } from '../services/software.service';
import type { AuthorizedSoftwareResponse, CreateAuthorizedSoftwareRequest } from '../interfaces';

// ── GET ALL ──────────────────────────────────────────────────────────────────

export function useAuthorizedSoftware() {
    const [authorizedSoftware, setAuthorizedSoftware] = useState<AuthorizedSoftwareResponse[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await SoftwareService.getAuthorizedSoftware();
            setAuthorizedSoftware(data);
        } catch {
            toast.error('Error al cargar el software autorizado');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return { authorizedSoftware, loading, refetch: fetchAll };
}

// ── ACTIONS (POST) ────────────────────────────────────────────────────────────

export function useAuthorizedSoftwareActions(onSuccess?: () => void) {
    const [loading, setLoading] = useState(false);

    const addToWhitelist = async (data: CreateAuthorizedSoftwareRequest): Promise<boolean> => {
        setLoading(true);
        try {
            await SoftwareService.addToWhitelist(data);
            toast.success('Software agregado a la lista de autorizados');
            onSuccess?.();
            return true;
        } catch {
            toast.error('Error al autorizar el software');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { addToWhitelist, loading };
}
