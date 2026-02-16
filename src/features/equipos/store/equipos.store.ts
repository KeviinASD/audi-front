import { create } from 'zustand';
import api from '@/lib/api/api';
import { toast } from 'sonner';
import type {
    IEquipment,
    ILaboratory,
    ICreateLaboratoryRequest,
    IUpdateLaboratoryRequest,
    IUpdateEquipmentRequest
} from '../interfaces';

interface EquiposState {
    equipos: IEquipment[];
    laboratorios: ILaboratory[];
    loading: boolean;

    // Actions Equipos
    fetchEquipos: () => Promise<void>;
    updateEquipo: (id: string, data: IUpdateEquipmentRequest) => Promise<boolean>;

    // Actions Laboratorios
    fetchLaboratorios: () => Promise<void>;
    createLaboratorio: (data: ICreateLaboratoryRequest) => Promise<boolean>;
    updateLaboratorio: (id: string, data: IUpdateLaboratoryRequest) => Promise<boolean>;
}

export const useEquiposStore = create<EquiposState>((set, get) => ({
    equipos: [],
    laboratorios: [],
    loading: false,

    fetchEquipos: async () => {
        set({ loading: true });
        try {
            const res = await api.get<IEquipment[]>('/equipos');
            set({ equipos: res.data, loading: false });
        } catch (error: any) {
            toast.error("Error al cargar equipos");
            set({ loading: false });
        }
    },

    updateEquipo: async (id: string, data: IUpdateEquipmentRequest) => {
        try {
            await api.patch(`/equipos/${id}`, data);
            toast.success("Equipo actualizado");
            get().fetchEquipos();
            return true;
        } catch (error: any) {
            toast.error("Error al actualizar equipo");
            return false;
        }
    },

    fetchLaboratorios: async () => {
        set({ loading: true });
        try {
            const res = await api.get<ILaboratory[]>('/laboratorios');
            set({ laboratorios: res.data, loading: false });
        } catch (error: any) {
            toast.error("Error al cargar laboratorios");
            set({ loading: false });
        }
    },

    createLaboratorio: async (data: ICreateLaboratoryRequest) => {
        try {
            await api.post('/laboratorios', data);
            toast.success("Laboratorio creado exitosamente");
            get().fetchLaboratorios();
            return true;
        } catch (error: any) {
            toast.error("Error al crear laboratorio");
            return false;
        }
    },

    updateLaboratorio: async (id: string, data: IUpdateLaboratoryRequest) => {
        try {
            await api.patch(`/laboratorios/${id}`, data);
            toast.success("Laboratorio actualizado");
            get().fetchLaboratorios();
            return true;
        } catch (error: any) {
            toast.error("Error al actualizar laboratorio");
            return false;
        }
    }
}));
