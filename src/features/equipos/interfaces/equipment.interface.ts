import type { LaboratoryResponse } from './laboratory.interface';

export type EquipmentStatus = 'operativo' | 'degradado' | 'critico' | 'sin-datos';

export interface EquipmentResponse {
    id: number;
    code: string;
    name: string;
    ubication: string;
    laboratory?: LaboratoryResponse;
    status: EquipmentStatus;
    lastConnection?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateEquipmentRequest {
    code: string;
    name: string;
    ubication?: string;
    laboratoryId?: number;
    isActive?: boolean;
}

export interface UpdateEquipmentRequest {
    code?: string;
    name?: string;
    ubication?: string;
    laboratoryId?: number;
    isActive?: boolean;
}
