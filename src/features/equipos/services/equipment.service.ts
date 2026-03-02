import api from '@/lib/api/api';
import type { EquipmentResponse, CreateEquipmentRequest, UpdateEquipmentRequest } from '../interfaces';

const BASE_URL = '/equipment';

export class EquipmentService {
    static async getAll(params?: { search?: string; labId?: number }): Promise<EquipmentResponse[]> {
        const res = await api.get<EquipmentResponse[]>(BASE_URL, { params });
        return res.data;
    }

    static async getById(id: number): Promise<EquipmentResponse> {
        const res = await api.get<EquipmentResponse>(`${BASE_URL}/${id}`);
        return res.data;
    }

    static async create(data: CreateEquipmentRequest): Promise<EquipmentResponse> {
        const res = await api.post<EquipmentResponse>(BASE_URL, data);
        return res.data;
    }

    static async update(id: number, data: UpdateEquipmentRequest): Promise<EquipmentResponse> {
        const res = await api.patch<EquipmentResponse>(`${BASE_URL}/${id}`, data);
        return res.data;
    }

    static async delete(id: number): Promise<void> {
        await api.delete(`${BASE_URL}/${id}`);
    }
}
